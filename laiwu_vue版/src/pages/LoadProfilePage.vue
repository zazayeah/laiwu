<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LineChartCard from "../components/LineChartCard.vue";
import { analyzeLoadProfile } from "../services/algorithmApi";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const stationIndex = ref(0);
const analysisLoading = ref(false);
const analysisResult = ref(null);
const scenario = computed(() => store.scenario);
const station = computed(() => scenario.value.stations[stationIndex.value] || scenario.value.stations[0]);

watch(
  () => store.scenarioKey,
  () => {
    stationIndex.value = 0;
  }
);

watch(
  [() => store.scenarioKey, () => station.value?.id],
  async () => {
    if (!station.value) return;
    analysisLoading.value = true;
    try {
      analysisResult.value = await analyzeLoadProfile({
        scenarioKey: store.scenarioKey,
        focusStation: station.value.id,
        stationIds: scenario.value.stations.map((item) => item.id),
        scenario: scenario.value
      });
    } finally {
      analysisLoading.value = false;
    }
  },
  { immediate: true }
);

const localSeries = computed(() => {
  const ratio = station.value.load / 3.8;
  const profileBump = station.value.cluster === "峰段敏感型" ? 1.12 : station.value.cluster === "午间消纳型" ? 1.08 : 1.02;
  const primary = scenario.value.loadSeries.actual.map((value, index) => {
    let factor = ratio;
    if (index >= 11 && index < 14 && station.value.cluster === "午间消纳型") factor += 0.35;
    if (index >= 18 && index < 22 && station.value.cluster === "峰段敏感型") factor += 0.4;
    if ((index < 6 || index >= 22) && station.value.cluster === "谷段承接型") factor += 0.28;
    return Number((value * factor * 0.26 * profileBump).toFixed(2));
  });
  const secondary = scenario.value.loadSeries.forecast.map((value, index) => {
    let factor = ratio;
    if (index >= 18 && index < 22) factor += station.value.use >= 85 ? 0.2 : 0.08;
    return Number((value * factor * 0.25).toFixed(2));
  });
  return { primary, secondary };
});

const chartSeries = computed(() => {
  if (analysisResult.value?.trend) {
    return {
      labels: analysisResult.value.trend.labels,
      primary: analysisResult.value.trend.load,
      secondary: analysisResult.value.trend.baseline
    };
  }
  return {
    labels: scenario.value.loadSeries.labels,
    primary: localSeries.value.primary,
    secondary: localSeries.value.secondary
  };
});

const stats = computed(() => {
  const primary = chartSeries.value.primary;
  const max = Math.max(...primary);
  const min = Math.min(...primary);
  return {
    peakValley: (max - min).toFixed(1),
    volatility: (
      analysisResult.value?.summary?.volatilityIndex ?? (((max - min) / max) * 100)
    ).toFixed(1),
    shock: Math.max(1, Math.round((analysisResult.value?.summary?.impactIndex ?? station.value.use) / 15)),
    cluster: analysisResult.value?.summary?.typicalCluster || station.value.cluster
  };
});

const analysisState = computed(() =>
  analysisLoading.value ? "算法计算中" : analysisResult.value?.status === "OK" ? "算法接口结果" : "本地回退结果"
);
</script>

<template>
  <section class="panel section">
    <div class="panel-head">
      <div>
        <h3 class="panel-title">站点画像切换</h3>
        <div class="panel-desc">切换站点后，同步刷新负荷曲线、波动指标和聚类标签。</div>
        <div class="muted">当前状态：{{ analysisState }}</div>
      </div>
      <div class="tabs">
        <button
          v-for="(item, index) in scenario.stations"
          :key="item.id"
          class="tab-btn"
          :class="{ active: index === stationIndex }"
          @click="stationIndex = index"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">当前站点</div>
        <div class="value" style="font-size:26px;">{{ station.name }}</div>
        <div class="muted">{{ station.status }}</div>
      </div>
      <div class="stat-card">
        <div class="label">峰谷差</div>
        <div class="value">{{ stats.peakValley }}</div>
        <div class="muted">MW</div>
      </div>
      <div class="stat-card">
        <div class="label">波动系数</div>
        <div class="value">{{ stats.volatility }}%</div>
        <div class="muted">短时冲击 {{ stats.shock }} 次/日</div>
      </div>
    </div>
  </section>

  <LineChartCard
    title="站点负荷时序画像"
    desc="对应时序特征评估、波动性与冲击性评估，以及负荷曲线聚类后的站点画像。"
    :labels="chartSeries.labels"
    :primary="chartSeries.primary"
    :secondary="chartSeries.secondary"
    primary-name="融合负荷"
    secondary-name="预测负荷"
    collapsible
  />

  <CollapsiblePanel
    class="section"
    title="时序特征与聚类画像"
    desc="合并展示时序特征评估和聚类画像结果。"
  >
    <section class="dual-grid" style="margin-top:0;">
      <div>
        <div class="label" style="margin-bottom:12px;">时序特征评估</div>
        <div class="notes">
          <div class="list-row"><strong>凌晨 00-06</strong><div class="bar-track"><span class="bar-fill" :style="{ width: `${station.use - 20}%` }"></span></div><span>谷段承接能力</span></div>
          <div class="list-row"><strong>上午 06-12</strong><div class="bar-track"><span class="bar-fill" :style="{ width: `${station.use - 10}%` }"></span></div><span>订单进入高峰</span></div>
          <div class="list-row"><strong>午间 12-16</strong><div class="bar-track"><span class="bar-fill" :style="{ width: `${station.use}%` }"></span></div><span>深谷/平段响应</span></div>
          <div class="list-row"><strong>晚间 16-22</strong><div class="bar-track"><span class="bar-fill" :style="{ width: `${Math.min(98, station.use + 8)}%` }"></span></div><span>重点关注峰段</span></div>
        </div>
      </div>

      <div>
        <div class="label" style="margin-bottom:12px;">聚类画像结果</div>
        <div class="list">
          <div class="info-card">
            <div class="label">聚类标签</div>
            <strong>{{ stats.cluster }}</strong>
            <p class="muted">作为后续预测和调节潜力评估的统一输入特征。</p>
          </div>
          <div class="info-card">
            <div class="label">站点利用率</div>
            <strong>{{ station.use }}%</strong>
            <p class="muted">当前可平移电量 {{ station.shift }} MWh，负荷状态 {{ station.status }}。</p>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>
</template>
