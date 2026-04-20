<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuMapSnapshot from "../components/LaiwuMapSnapshot.vue";
import { evaluateFlexibility, predictUserProfile } from "../services/algorithmApi";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const decisionLoading = ref(false);
const decisionBundle = ref(null);
const scenario = computed(() => store.scenario);

watch(
  () => store.scenarioKey,
  async () => {
    const stations = scenario.value.stations || [];
    decisionLoading.value = true;
    try {
      const [flexibility, userProfile] = await Promise.all([
        evaluateFlexibility({
          scenarioKey: store.scenarioKey,
          serviceGuard: 90,
          priceSpread: 0.82,
          scenario: scenario.value
        }),
        predictUserProfile({
          scenarioKey: store.scenarioKey,
          stationIds: stations.map((item) => item.id),
          horizonHours: 4,
          scenario: scenario.value
        })
      ]);
      decisionBundle.value = { flexibility, userProfile };
    } finally {
      decisionLoading.value = false;
    }
  },
  { immediate: true }
);

const hasRemoteDecisionData = computed(
  () =>
    decisionBundle.value?.flexibility?.status === "OK"
    || decisionBundle.value?.userProfile?.status === "OK"
);

const decisionState = computed(() => {
  if (decisionLoading.value) {
    return "综合分析计算中";
  }
  return hasRemoteDecisionData.value ? "综合结果已接入算法服务" : "当前使用本地回退结果";
});

const stationForecastMap = computed(
  () => new Map((decisionBundle.value?.userProfile?.demandPrediction?.stationForecast || []).map((item) => [item.stationId, item]))
);

const stationPortraitMap = computed(
  () => new Map((decisionBundle.value?.userProfile?.stationPortraits || []).map((item) => [item.stationId, item]))
);

const allStreetWarnings = computed(() =>
  (scenario.value.mapTopic?.townships || [])
    .filter((item) => item.utilization >= 70)
    .sort((a, b) => b.utilization - a.utilization)
    .map((item) => ({
      name: item.name,
      utilization: item.utilization,
      level: item.utilization >= 85 ? "红色高风险" : "黄色关注",
      note: (item.reason || item.recommendation || "").slice(0, 24)
    }))
);

const focusStreetWarnings = computed(() => allStreetWarnings.value.slice(0, 3));

const allStationWarnings = computed(() =>
  (scenario.value.stations || [])
    .filter((item) => item.use >= 70)
    .sort((a, b) => b.use - a.use)
    .map((item) => ({
      id: item.id,
      name: item.name,
      district: item.district,
      load: item.load,
      use: item.use,
      level: item.use >= 85 ? "红色高负载" : "黄色中负载",
      demandMwh: stationForecastMap.value.get(item.id)?.demandMwh
    }))
);

const focusStationWarnings = computed(() => allStationWarnings.value.slice(0, 3));

const flexibleStations = computed(() =>
  (scenario.value.stations || [])
    .filter((item) => item.use >= 80 || item.shift >= 5)
    .sort((a, b) => b.use - a.use || b.shift - a.shift)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      name: item.name,
      use: item.use,
      shift: item.shift,
      action: item.use >= 85 ? "启动分时降功率与柔性排队" : "启动预约分流与柔性调节",
      desc: `当前利用率 ${item.use}% ，可平移 ${item.shift} MWh`
    }))
);

const encourageStations = computed(() =>
  (scenario.value.stations || [])
    .filter((item) => item.use < 70)
    .sort((a, b) => b.shift - a.shift || a.use - b.use)
    .slice(0, 4)
    .map((item) => {
      const portrait = stationPortraitMap.value.get(item.id);
      const forecast = stationForecastMap.value.get(item.id);
      return {
        id: item.id,
        name: item.name,
        use: item.use,
        shift: item.shift,
        action: "纳入优先引导补能站点",
        desc: `利用率 ${item.use}% ，主导群体 ${portrait?.dominantSegment || "待识别"}，预计需求 ${forecast?.demandMwh ?? "-"} MWh`
      };
    })
);

const avoidStations = computed(() =>
  (scenario.value.stations || [])
    .filter((item) => item.use >= 85)
    .sort((a, b) => b.use - a.use)
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      name: item.name,
      district: item.district,
      load: item.load,
      use: item.use,
      action: "限制新增车辆集中到站",
      desc: `当前负荷 ${item.load} MW ，利用率 ${item.use}%`
    }))
);

const reroutePlans = computed(() => {
  const targets = encourageStations.value;
  if (!targets.length) return [];
  return avoidStations.value.map((item, index) => {
    const target = targets[index % targets.length];
    return {
      from: item.name,
      to: target.name,
      note: `优先将低时效订单从 ${item.name} 分流至 ${target.name}`
    };
  });
});

const optimizationCards = computed(() => [
  {
    label: "排序依据",
    value: "停车时长 + 发车时刻",
    desc: "优先识别可整夜停放和低时效订单"
  },
  {
    label: "主优化窗口",
    value: "22:00-06:00",
    desc: "利用夜间停车实现移峰填谷"
  },
  {
    label: "承接站点",
    value: `${encourageStations.value.length} 个`,
    desc: "优先导入低负载站点承接补能"
  }
]);

const chargingPriorityRows = computed(() => {
  const segments = scenario.value.segments || [];
  const candidateTargets = encourageStations.value.map((item) => item.name);
  const fallbackTarget = candidateTargets[0] || scenario.value.stations?.[0]?.name || "-";
  const flexibilityScoreMap = { 高: 4, 中高: 3, 中: 2, 低: 1 };

  return segments
    .map((segment) => {
      const prefNames = segment.timePrefs?.map((item) => item.name) || [];
      const hasNightParking = prefNames.some((name) => /夜间|凌晨/.test(name)) || /长途/.test(segment.label);
      const hasMiddayWindow = prefNames.some((name) => /午间/.test(name)) || /园区/.test(segment.label);
      const score = (flexibilityScoreMap[segment.flexibility] || 1) + (hasNightParking ? 3 : 0) + (hasMiddayWindow ? 1 : 0);

      let window = "13:00-17:00";
      let rule = "峰前递延";
      let reason = "保留刚性订单，低时效订单递延补能";
      let target = candidateTargets[2] || candidateTargets[0] || fallbackTarget;

      if (hasNightParking) {
        window = "22:00-06:00";
        rule = "夜间停车优先充电";
        reason = "停车时长长，适合谷段整夜补能";
        target = candidateTargets[0] || fallbackTarget;
      } else if (hasMiddayWindow) {
        window = "11:00-15:00";
        rule = "午间低谷承接";
        reason = "驻留时间稳定，可错开晚高峰";
        target = candidateTargets[1] || candidateTargets[0] || fallbackTarget;
      }

      const energy = ((Number(segment.share || 0) / 100) * Number(strategySummary.value.shiftableEnergyMwh || 0)).toFixed(1);

      return {
        key: segment.key,
        label: segment.label,
        window,
        rule,
        reason,
        target,
        energy: `${energy} MWh`,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      priority: `P${index + 1}`,
      command: `${item.label} 优先安排至 ${item.target}，补能窗口 ${item.window}`
    }));
});

const stationCommandRows = computed(() => [
  ...flexibleStations.value.map((item) => ({
    key: `flex-${item.id}`,
    station: item.name,
    command: "柔性调节",
    detail: "晚高峰执行分时降功率或柔性排队"
  })),
  ...encourageStations.value.slice(0, 1).map((item) => ({
    key: `guide-${item.id}`,
    station: item.name,
    command: "承接补能",
    detail: "优先承接夜间驻车和低时效订单"
  })),
  ...avoidStations.value.slice(0, 1).map((item) => ({
    key: `limit-${item.id}`,
    station: item.name,
    command: "限制到站",
    detail: "暂停新增集中到站并发布替代站点"
  }))
]);

const strategySummary = computed(() => {
  const summary = decisionBundle.value?.flexibility?.summary;
  if (!summary) {
    return {
      shiftableEnergyMwh: scenario.value.metrics?.[2]?.value || "--",
      reduciblePowerMw: "--",
      expectedBenefitWan: scenario.value.metrics?.[3]?.value || "--"
    };
  }
  return summary;
});
</script>

<template>
  <CollapsiblePanel
    class="section"
    title="预警通知"
    desc="仅保留当前最需要处置的街道/乡镇和站点预警。"
  >
    <template #header>
      <div>
        <h3 class="panel-title">预警通知</h3>
        <div class="panel-desc">仅保留当前最需要处置的街道/乡镇和站点预警。</div>
        <div class="muted">当前状态：{{ decisionState }}</div>
      </div>
    </template>
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">红色风险街道</div>
        <div class="value">{{ allStreetWarnings.filter((item) => item.level.includes("红色")).length }}</div>
        <div class="muted">当前需要优先关注的街道/乡镇</div>
      </div>
      <div class="stat-card">
        <div class="label">红色高负载站点</div>
        <div class="value">{{ allStationWarnings.filter((item) => item.level.includes("红色")).length }}</div>
        <div class="muted">建议立即启动分流或柔性控制</div>
      </div>
      <div class="stat-card">
        <div class="label">黄色关注站点</div>
        <div class="value">{{ allStationWarnings.filter((item) => item.level.includes("黄色")).length }}</div>
        <div class="muted">需要跟踪后续负荷抬升趋势</div>
      </div>
    </div>

    <section class="dual-grid" style="margin-top:18px;">
      <div>
        <div class="label" style="margin-bottom:12px;">街道预警</div>
        <div class="notes">
          <div v-for="item in focusStreetWarnings" :key="item.name" class="list-row">
            <strong>{{ item.name }}</strong>
            <div class="muted">{{ item.note }}</div>
            <span>{{ item.level }} / {{ item.utilization }}%</span>
          </div>
        </div>
      </div>

      <div>
        <div class="label" style="margin-bottom:12px;">站点预警</div>
        <div class="notes">
          <div v-for="item in focusStationWarnings" :key="item.id" class="list-row">
            <strong>{{ item.name }}</strong>
            <div class="muted">{{ item.district }} / 预计需求 {{ item.demandMwh ?? "-" }} MWh</div>
            <span>{{ item.level }} / {{ item.load }} MW</span>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="AI充电次序优化"
    desc="按停车时长、夜间驻车、发车时刻和站点负荷生成可执行排程，优先把可延后订单排入夜间和低谷窗口。"
  >
    <div class="card-grid" style="margin-top:18px;">
      <div class="stat-card">
        <div class="label">可平移电量</div>
        <div class="value">{{ strategySummary.shiftableEnergyMwh }}</div>
        <div class="muted">MWh</div>
      </div>
      <div class="stat-card">
        <div class="label">可削减功率</div>
        <div class="value">{{ strategySummary.reduciblePowerMw }}</div>
        <div class="muted">MW</div>
      </div>
      <div class="stat-card">
        <div class="label">预估收益</div>
        <div class="value">{{ strategySummary.expectedBenefitWan }}</div>
        <div class="muted">万元</div>
      </div>
    </div>

    <div class="card-grid strategy-card-grid" style="margin-top:18px;">
      <div v-for="item in optimizationCards" :key="item.label" class="stat-card">
        <div class="label">{{ item.label }}</div>
        <div class="value strategy-card-value">{{ item.value }}</div>
        <div class="muted">{{ item.desc }}</div>
      </div>
    </div>

    <section class="dual-grid" style="margin-top:18px;">
      <div class="decision-block">
        <div class="label">AI排程指令</div>
        <div class="priority-list">
          <div v-for="item in chargingPriorityRows" :key="item.key" class="priority-row">
            <div class="priority-rank">{{ item.priority }}</div>
            <div class="priority-main">
              <strong>{{ item.command }}</strong>
              <div class="muted">{{ item.rule }} · {{ item.reason }}</div>
            </div>
            <div class="priority-meta">
              <span>对象：{{ item.label }}</span>
              <span>站点：{{ item.target }}</span>
              <span>电量：{{ item.energy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="decision-block">
        <div class="label">站点调度口令</div>
        <div class="notes">
          <div v-for="item in stationCommandRows" :key="item.key" class="list-row">
            <strong>{{ item.station }}</strong>
            <div class="muted">{{ item.command }}</div>
            <span>{{ item.detail }}</span>
          </div>
        </div>
      </div>
    </section>

    <div class="decision-block" style="margin-top:18px;">
      <div class="label">移峰填谷分流路径</div>
      <div class="notes">
        <div v-for="item in reroutePlans" :key="`${item.from}-${item.to}`" class="list-row">
          <strong>{{ item.from }}</strong>
          <div class="muted">夜间驻车和低时效订单优先外移</div>
          <span>{{ item.to }}</span>
        </div>
      </div>
    </div>
  </CollapsiblePanel>

  <section style="margin-top:18px;">
    <LaiwuMapSnapshot
      title="辅助决策空间视图"
      desc="在辅助决策页同步查看莱芜真实地图与重点站点状态。"
      :show-station-labels="false"
      :interactive-legend="false"
      side-mode="decision"
      :districts="scenario.mapTopic.districts"
      :stations="scenario.stations"
      collapsible
    />
  </section>
</template>

<style scoped>
.decision-block {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid #dfe9f7;
  border-radius: 8px;
  background: #f8fbff;
}

.strategy-card-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.strategy-card-value {
  font-size: 18px !important;
  line-height: 1.35;
}

.priority-list {
  display: grid;
  gap: 10px;
}

.priority-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) 220px;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid #dfe9f7;
  border-radius: 8px;
  background: #fff;
}

.priority-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eaf2ff;
  color: #1f4f99;
  font-weight: 700;
}

.priority-main {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.priority-meta {
  display: grid;
  gap: 4px;
  justify-items: end;
  color: #526377;
  font-size: 13px;
}

@media (max-width: 900px) {
  .strategy-card-grid {
    grid-template-columns: 1fr;
  }

  .priority-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .priority-meta {
    grid-column: 1 / -1;
    justify-items: start;
    padding-left: 40px;
  }
}
</style>
