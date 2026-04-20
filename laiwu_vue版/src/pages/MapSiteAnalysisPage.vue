<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuTownshipPanel from "../components/LaiwuTownshipPanel.vue";
import LaiwuTownshipStationSnapshot from "../components/LaiwuTownshipStationSnapshot.vue";
import LineChartCard from "../components/LineChartCard.vue";
import MetricGrid from "../components/MetricGrid.vue";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const scenario = computed(() => store.scenario);
const selectedTownshipKey = ref("");

watch(
  () => store.scenarioKey,
  () => {
    selectedTownshipKey.value = scenario.value.mapTopic.townships[0]?.key || "";
  },
  { immediate: true }
);

const townshipStationStats = computed(() =>
  scenario.value.mapTopic.townships.map((township) => {
    const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
    return {
      ...township,
      stationCount: relatedStations.length,
      pileCount: relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0)
    };
  })
);

const siteMetrics = computed(() => {
  const townships = townshipStationStats.value;
  return [
    { label: "覆盖乡镇", value: String(townships.length), unit: "个", sub: "真实乡镇边界覆盖" },
    { label: "有站点乡镇", value: String(townships.filter((item) => item.stationCount > 0).length), unit: "个", sub: "当前已有充电站" },
    { label: "低覆盖乡镇", value: String(townships.filter((item) => item.stationCount === 0).length), unit: "个", sub: "可作为布点关注区域" },
    { label: "高承载乡镇", value: String(townships.filter((item) => item.pileCount > 0 && item.utilization >= 85).length), unit: "个", sub: "优先关注增站或扩容" }
  ];
});

const selectedTownship = computed(
  () => scenario.value.mapTopic.townships.find((item) => item.key === selectedTownshipKey.value) || scenario.value.mapTopic.townships[0]
);

const townshipTrendSeries = computed(() => {
  const township = selectedTownship.value;
  const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
  const stationCount = relatedStations.length;
  const pileCount = relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  const maxEnergy = Math.max(...township.energySeries, 0);
  const carryStateSeries = pileCount > 0
    ? township.energySeries.map((value) => (maxEnergy > 0 ? Math.round((value / maxEnergy) * township.utilization) : 0))
    : Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => 0);

  return {
    stationSeries: Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => stationCount || 0),
    pileSeries: township.pileSeries || Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => pileCount || 0),
    energySeries: township.energySeries,
    carryStateSeries
  };
});

const townshipSummary = computed(() => {
  const township = selectedTownship.value;
  const latestEnergy = township.energySeries[township.energySeries.length - 1];
  const previousEnergy = township.energySeries[township.energySeries.length - 2];
  const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
  const pileCount = relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  return [
    { label: "充电站数量", value: `${relatedStations.length}`, desc: "基于当前真实站点台账统计" },
    { label: "充电桩数量", value: `${pileCount}`, desc: "快充桩与慢充桩数量汇总" },
    { label: "当前充电量", value: `${latestEnergy}`, desc: `较上期 ${latestEnergy - previousEnergy >= 0 ? "+" : ""}${latestEnergy - previousEnergy} MWh` },
    {
      label: "承载状态",
      value: pileCount > 0 ? `${township.utilization}%` : "绿色未覆盖",
      desc: pileCount > 0 ? township.recommendation : "当前无充电桩，暂无法形成承载状态"
    }
  ];
});
</script>

<template>
  <MetricGrid :items="siteMetrics" />

  <LaiwuTownshipStationSnapshot
    class="overview-map-hero"
    title="莱芜乡镇/街道充电站数量分区图"
    desc="按乡镇/街道统计现有充电站数量，以红黄绿三色反映布点覆盖差异，支撑区域新增站点研判。"
    :stations="scenario.stations"
    :townships="scenario.mapTopic.townships"
    collapsible
  />

  <LaiwuTownshipPanel
    class="section"
    title="乡镇/街道细化决策研判"
    desc="按乡镇/街道查看真实站点分布、现有充电桩数量、历史充电量和充电桩承载状态，用于判断是否需要新增充电站。"
    :labels="scenario.mapTopic.townshipLabels"
    :stations="scenario.stations"
    :townships="scenario.mapTopic.townships"
    :selected-key="selectedTownshipKey"
    @select="selectedTownshipKey = $event"
    collapsible
  >
    <template #actions>
      <div class="tabs single-line-tabs">
        <button
          v-for="item in scenario.mapTopic.townships"
          :key="item.key"
          class="tab-btn"
          :class="{ active: item.key === selectedTownshipKey }"
          @click="selectedTownshipKey = item.key"
        >
          {{ item.name }}
        </button>
      </div>
    </template>
  </LaiwuTownshipPanel>

  <CollapsiblePanel
    class="section"
    title="乡镇/街道历史趋势"
    desc="合并展示当前选中乡镇/街道的站点、充电桩、充电量和承载状态历史趋势。"
  >
    <section class="dual-grid township-trend-grid" style="margin-top:0;">
      <LineChartCard
        :title="`${selectedTownship.name}历史充电站数量`"
        desc="按现有真实充电站台账回溯展示；无站点乡镇按 0 展示。"
        :labels="scenario.mapTopic.townshipLabels"
        :primary="townshipTrendSeries.stationSeries"
        primary-name="充电站数量(座)"
        :embedded="true"
      />
      <LineChartCard
        :title="`${selectedTownship.name}历史充电桩数量`"
        desc="按现有真实充电桩台账回溯展示；无站点乡镇按 0 展示。"
        :labels="scenario.mapTopic.townshipLabels"
        :primary="townshipTrendSeries.pileSeries"
        primary-name="充电桩数量(个)"
        :embedded="true"
      />
      <LineChartCard
        :title="`${selectedTownship.name}历史充电量`"
        desc="用于判断该乡镇充电需求增长速度与负荷抬升趋势。"
        :labels="scenario.mapTopic.townshipLabels"
        :primary="townshipTrendSeries.energySeries"
        primary-name="充电量(MWh)"
        :embedded="true"
      />
      <LineChartCard
        :title="`${selectedTownship.name}历史承载状态`"
        desc="按历史充电量走势换算展示，用于观察乡镇充电桩承载压力变化。"
        :labels="scenario.mapTopic.townshipLabels"
        :primary="townshipTrendSeries.carryStateSeries"
        primary-name="承载状态(%)"
        :embedded="true"
      />
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
    title="乡镇摘要"
    desc="汇总当前选中乡镇的站点、充电桩、充电量和承载状态。"
  >
    <section class="card-grid township-summary-grid">
      <div v-for="item in townshipSummary" :key="item.label" class="stat-card">
        <div class="label">{{ item.label }}</div>
        <div class="value" style="font-size:24px;">{{ item.value }}</div>
        <div class="muted">{{ item.desc }}</div>
      </div>
    </section>
  </CollapsiblePanel>
</template>
