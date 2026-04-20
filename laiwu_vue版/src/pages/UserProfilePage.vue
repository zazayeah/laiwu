<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import { buildStationUserProfiles } from "../data/dashboard";
import { predictUserProfile } from "../services/algorithmApi";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const segmentIndex = ref(0);
const predictionLoading = ref(false);
const predictionResult = ref(null);
const scenario = computed(() => store.scenario);
const mergedSegments = computed(() =>
  scenario.value.segments.map((item, index) => {
    const remote = predictionResult.value?.segments?.[index];
    return remote
      ? {
          ...item,
          share: remote.share ?? item.share,
          avgEnergy: remote.avgEnergy ?? item.avgEnergy,
          flexibility: remote.flexibility ?? item.flexibility,
          label: remote.name ?? item.label
        }
      : item;
  })
);
const segment = computed(() => mergedSegments.value[segmentIndex.value] || mergedSegments.value[0]);

watch(
  () => store.scenarioKey,
  () => {
    segmentIndex.value = 0;
  }
);

watch(
  () => store.scenarioKey,
  async () => {
    predictionLoading.value = true;
    try {
      predictionResult.value = await predictUserProfile({
        scenarioKey: store.scenarioKey,
        stationIds: scenario.value.stations.map((item) => item.id),
        horizonHours: 4,
        scenario: scenario.value
      });
    } finally {
      predictionLoading.value = false;
    }
  },
  { immediate: true }
);

function parseMetric(value) {
  const matched = `${value ?? ""}`.match(/[\d.]+/);
  return matched ? Number(matched[0]) : 0;
}

const stationForecast = computed(() => predictionResult.value?.demandPrediction?.stationForecast || []);
const stationPortraits = computed(() => {
  const localRows = buildStationUserProfiles(scenario.value, mergedSegments.value);
  const remoteRows = predictionResult.value?.stationPortraits || [];
  const remoteMap = new Map(
    remoteRows.map((item) => [item.stationId || item.stationName, item])
  );
  const forecastMap = new Map(stationForecast.value.map((item) => [item.stationId, item]));

  return localRows.map((item) => {
    const remote = remoteMap.get(item.stationId) || remoteMap.get(item.stationName);
    const forecast = forecastMap.get(item.stationId);
    return {
      ...item,
      ...remote,
      segments: remote?.segments?.length
        ? remote.segments.map((segment, index) => ({
            ...segment,
            color: segment.color || item.segments[index]?.color || "#6f9be8"
          }))
        : item.segments,
      demandMwh: remote?.demandMwh ?? forecast?.demandMwh,
      peakWindow: remote?.peakWindow ?? forecast?.peakWindow ?? item.peakWindow
    };
  });
});
const portraitSummary = computed(() => {
  const rows = stationPortraits.value;
  if (!rows.length) {
    return {
      mostFocused: "-",
      highestFlex: "-"
    };
  }
  const mostFocused = [...rows].sort(
    (a, b) => Math.max(...b.segments.map((item) => item.share)) - Math.max(...a.segments.map((item) => item.share))
  )[0];
  const highestFlex = [...rows].sort(
    (a, b) => Number.parseFloat(b.flexibleShare) - Number.parseFloat(a.flexibleShare)
  )[0];
  return {
    mostFocused: `${mostFocused.stationName} / ${mostFocused.dominantSegment}`,
    highestFlex: `${highestFlex.stationName} / ${highestFlex.flexibleShare}`
  };
});
const behaviorPrediction = computed(() => {
  const currentSegment = segment.value;
  const timePrefs = [...(currentSegment.timePrefs || [])].sort((a, b) => b.share - a.share);
  const stationPrefs = [...(currentSegment.stationPrefs || [])].sort((a, b) => b.share - a.share);
  const topTime = timePrefs[0] || { name: "-", share: 0 };
  const topStation = stationPrefs[0] || { name: "-", share: 0 };
  const backupStation = stationPrefs[1] || topStation;
  const rows = stationPortraits.value;
  const segmentKey = currentSegment.key;
  const predictedTrips = rows.reduce((sum, item) => {
    const share = item.segments.find((row) => row.key === segmentKey)?.share || 0;
    return sum + Math.round(item.activeTrips * share / 100);
  }, 0);
  const predictedDemand = rows.reduce((sum, item) => {
    const share = item.segments.find((row) => row.key === segmentKey)?.share || 0;
    return sum + ((item.demandMwh || 0) * share / 100);
  }, 0);
  const riskStation =
    [...rows].sort(
      (a, b) => ((b.demandMwh || 0) * 0.7 + parseMetric(b.loadShare) * 0.3) - ((a.demandMwh || 0) * 0.7 + parseMetric(a.loadShare) * 0.3)
    )[0] || { stationName: "-", peakWindow: "-", demandMwh: 0 };
  const diversionStation =
    [...rows]
      .filter((item) => item.stationName !== topStation.name)
      .sort((a, b) => (parseMetric(b.flexibleShare) - parseMetric(b.loadShare) * 0.3) - (parseMetric(a.flexibleShare) - parseMetric(a.loadShare) * 0.3))[0] ||
    { stationName: backupStation.name || "-", flexibleShare: "-" };

  return {
    cards: [
      { label: "主到站窗口", value: topTime.name, sub: `预计占当前群体 ${topTime.share}%` },
      { label: "预计活跃车次", value: `${predictedTrips} 车次`, sub: `未来4小时需求约 ${predictedDemand.toFixed(1)} MWh` },
      { label: "重点迁移方向", value: `${topStation.name} -> ${diversionStation.stationName}`, sub: "并发抬升后的优先分流路径" },
      { label: "排队风险站点", value: riskStation.stationName, sub: `${riskStation.peakWindow} 容易形成排队` }
    ],
    actions: [
      {
        title: "到站行为预测",
        value: `${topTime.name}集中`,
        desc: `${currentSegment.label} 未来4小时预计在 ${topTime.name} 集中到站，活跃规模约 ${predictedTrips} 车次。`
      },
      {
        title: "站点选择预测",
        value: `${topStation.name}`,
        desc: `首选站点仍为 ${topStation.name}，当并发升高时预计将向 ${diversionStation.stationName} 分流。`
      },
      {
        title: "排队风险预测",
        value: `${riskStation.demandMwh || "-"} MWh`,
        desc: `${riskStation.stationName} 在 ${riskStation.peakWindow} 的短期需求最高，需要提前预留排队和功率控制。`
      },
      {
        title: "柔性引导预测",
        value: `${diversionStation.flexibleShare || "-"}`,
        desc: `${diversionStation.stationName} 的柔性用户占比较高，更适合承接预约错峰和价格引导订单。`
      }
    ]
  };
});
const predictionState = computed(() =>
  predictionLoading.value ? "算法计算中" : predictionResult.value?.status === "OK" ? "算法接口结果" : "本地回退结果"
);
</script>

<template>
  <section class="panel section">
    <div class="panel-head">
      <div>
        <h3 class="panel-title">用户群体画像切换</h3>
        <div class="panel-desc">按充电时段、频率、电量等行为数据划分典型群体，并预测短期需求分布。</div>
        <div class="muted">当前状态：{{ predictionState }}</div>
      </div>
      <div class="tabs">
        <button
          v-for="(item, index) in mergedSegments"
          :key="item.key"
          class="tab-btn"
          :class="{ active: index === segmentIndex }"
          @click="segmentIndex = index"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">当前群体</div>
        <div class="value" style="font-size:26px;">{{ segment.label }}</div>
        <div class="muted">占比 {{ segment.share }}%，柔性水平 {{ segment.flexibility }}</div>
      </div>
      <div class="stat-card">
        <div class="label">分群依据</div>
        <div class="value" style="font-size:22px;">{{ segment.avgEnergy }}</div>
        <div class="muted">{{ segment.basis }}</div>
      </div>
      <div class="stat-card">
        <div class="label">日均频次</div>
        <div class="value">{{ segment.frequency }}</div>
        <div class="muted">支撑短期需求预测输入</div>
      </div>
    </div>
  </section>

  <CollapsiblePanel
    class="section"
    title="各充电站用户群体分布及指标"
    desc="按站点展示用户群体构成，以及日均活跃车次、户均电量、柔性用户占比和短期需求指标。"
    :default-open="false"
  >
    <div class="card-grid" style="margin-top:18px;">
      <div class="stat-card">
        <div class="label">覆盖站点</div>
        <div class="value">{{ stationPortraits.length }}</div>
        <div class="muted">当前画像站点数</div>
      </div>
      <div class="stat-card">
        <div class="label">分化最明显站点</div>
        <div class="value station-summary-value">{{ portraitSummary.mostFocused }}</div>
        <div class="muted">主导群体集中度最高</div>
      </div>
      <div class="stat-card">
        <div class="label">柔性用户最高站点</div>
        <div class="value station-summary-value">{{ portraitSummary.highestFlex }}</div>
        <div class="muted">高/中高柔性群体占比领先</div>
      </div>
    </div>
    <div class="station-profile-list">
      <article v-for="item in stationPortraits" :key="item.stationId" class="station-profile-row">
        <div>
          <strong>{{ item.stationName }}</strong>
          <div class="muted">主导群体 {{ item.dominantSegment }} · 峰值窗口 {{ item.peakWindow }}</div>
        </div>
        <div class="station-profile-tags">
          <span class="tag">{{ item.loadShare }} 负荷贡献</span>
          <span class="tag">{{ item.flexibilityScore }}</span>
        </div>
        <div class="station-profile-stack">
          <span
            v-for="segment in item.segments"
            :key="`${item.stationId}-${segment.key}`"
            class="station-profile-stack-item"
            :style="{ width: `${segment.share}%`, background: segment.color }"
          >
            {{ segment.name }} {{ segment.share }}%
          </span>
        </div>
        <div class="station-profile-metrics">
          <span>日均活跃 {{ item.activeTrips }} 车次</span>
          <span>户均电量 {{ item.avgEnergy }}</span>
          <span>柔性用户 {{ item.flexibleShare }}</span>
          <span>短期需求 {{ item.demandMwh ?? "-" }} MWh</span>
        </div>
      </article>
    </div>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="各站点短期需求预测"
    desc="用于支撑各站点未来短期需求总量及时序分布研判。"
    :default-open="false"
  >
    <div class="notes">
      <div v-for="item in stationForecast" :key="item.stationId" class="list-row">
        <strong>{{ item.stationName || item.stationId }}</strong>
        <div class="bar-track"><span class="bar-fill" :style="{ width: `${Math.min(100, item.demandMwh * 8)}%` }"></span></div>
        <span>{{ item.demandMwh }} MWh / {{ item.peakWindow }}</span>
      </div>
    </div>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="未来短期行为预测"
    desc="聚焦未来短期的到站窗口、站点迁移、排队风险和柔性引导，不再展示意义较弱的时序曲线。"
    :default-open="false"
  >
    <div class="card-grid" style="margin-top:18px;">
      <div v-for="item in behaviorPrediction.cards" :key="item.label" class="stat-card">
        <div class="label">{{ item.label }}</div>
        <div class="value behavior-card-value">{{ item.value }}</div>
        <div class="muted">{{ item.sub }}</div>
      </div>
    </div>
    <div class="behavior-list">
      <div v-for="item in behaviorPrediction.actions" :key="item.title" class="behavior-row">
        <div>
          <strong>{{ item.title }}</strong>
          <div class="muted">{{ item.desc }}</div>
        </div>
        <span class="tag">{{ item.value }}</span>
      </div>
    </div>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="群体偏好分布"
    desc="合并展示当前群体的站点选择偏好与充电时段偏好。"
    :default-open="false"
  >
    <section class="dual-grid preference-grid">
      <div class="preference-block">
        <h4 class="preference-title">站点偏好分布</h4>
        <div class="notes">
          <div v-for="item in segment.stationPrefs" :key="item.name" class="list-row">
            <strong>{{ item.name }}</strong>
            <div class="bar-track"><span class="bar-fill" :style="{ width: `${item.share}%` }"></span></div>
            <span>{{ item.share }}%</span>
          </div>
        </div>
      </div>

      <div class="preference-block">
        <h4 class="preference-title">充电时段偏好</h4>
        <div class="notes">
          <div v-for="item in segment.timePrefs" :key="item.name" class="list-row">
            <strong>{{ item.name }}</strong>
            <div class="bar-track"><span class="bar-fill" :style="{ width: `${item.share}%` }"></span></div>
            <span>{{ item.share }}%</span>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>
</template>

<style scoped>
.preference-grid {
  margin-top: 0;
}

.preference-block {
  display: grid;
  gap: 12px;
}

.preference-title {
  margin: 0;
  font-size: 15px;
  color: #28405e;
}

.station-profile-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.station-profile-row {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #dfe9f7;
  border-radius: 8px;
  background: #f8fbff;
}

.station-profile-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.station-profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.station-profile-stack {
  display: flex;
  width: 100%;
  min-height: 34px;
  overflow: hidden;
  border-radius: 8px;
  background: #e9eff7;
}

.station-profile-stack-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 8px;
  color: #16324f;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.station-profile-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: #526377;
  font-size: 13px;
}

.behavior-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.behavior-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  border: 1px solid #dfe9f7;
  border-radius: 8px;
  background: #f8fbff;
}

.station-summary-value {
  font-size: 18px !important;
  line-height: 1.5;
}

.behavior-card-value {
  font-size: 19px !important;
  line-height: 1.4;
}

@media (max-width: 900px) {
  .behavior-row,
  .station-profile-head {
    flex-direction: column;
  }

  .station-profile-tags {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .station-profile-stack {
    min-height: auto;
    flex-direction: column;
  }

  .station-profile-stack-item {
    justify-content: flex-start;
    min-height: 30px;
  }
}
</style>
