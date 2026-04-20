<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuMapPanel from "../components/LaiwuMapPanel.vue";
import LaiwuTownshipPanel from "../components/LaiwuTownshipPanel.vue";
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

const mapMetrics = computed(() => [
  { label: "地图覆盖站点", value: String(scenario.value.stations.length), unit: "座", sub: "真实站点信息落图展示" },
  { label: "绿色容量充足", value: String(scenario.value.stations.filter((item) => item.use < 70).length), unit: "座", sub: "容量充足，可继续承接负荷" },
  { label: "黄色预警区", value: String(scenario.value.stations.filter((item) => item.use >= 70 && item.use < 85).length), unit: "座", sub: "需群控接入" },
  { label: "红色受限区", value: String(scenario.value.stations.filter((item) => item.use >= 85).length), unit: "座", sub: "需要增容" }
]);

const selectedTownship = computed(
  () => scenario.value.mapTopic.townships.find((item) => item.key === selectedTownshipKey.value) || scenario.value.mapTopic.townships[0]
);

const townshipTrendSeries = computed(() => {
  const township = selectedTownship.value;
  const relatedStations = scenario.value.stations.filter((item) => item.townshipKey === township.key);
  const stationCount = relatedStations.length;
  const pileCount = relatedStations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  const maxEnergy = Math.max(...township.energySeries, 0);
  const utilizationSeries = township.energySeries.map((value) =>
    maxEnergy > 0 ? Math.round((value / maxEnergy) * township.utilization) : 0
  );

  return {
    stationSeries: Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => stationCount || 0),
    pileSeries: township.pileSeries || Array.from({ length: scenario.value.mapTopic.townshipLabels.length }, () => pileCount || 0),
    energySeries: township.energySeries,
    utilizationSeries
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
    { label: "利用率", value: `${township.utilization}%`, desc: `${township.zoneLabel} · ${township.advice}` }
  ];
});
</script>

<template>
  <MetricGrid :items="mapMetrics" />

  <section class="section">
    <LaiwuMapPanel :districts="scenario.mapTopic.districts" :stations="scenario.stations" />
  </section>

  <CollapsiblePanel
    class="section"
    title="乡镇/街道细化决策研判"
    desc="按乡镇查看真实站点分布、现有充电桩数量和历史充电量趋势，用于判断是否需要新增充电站。"
  >
    <template #header>
      <div>
        <h3 class="panel-title">乡镇/街道细化决策研判</h3>
        <div class="panel-desc">按乡镇查看真实站点分布、现有充电桩数量和历史充电量趋势，用于判断是否需要新增充电站。</div>
      </div>
    </template>
    <template #actions>
      <div class="tabs">
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
  </CollapsiblePanel>

  <section class="section">
    <LaiwuTownshipPanel
      :labels="scenario.mapTopic.townshipLabels"
      :stations="scenario.stations"
      :townships="scenario.mapTopic.townships"
      :selected-key="selectedTownshipKey"
      @select="selectedTownshipKey = $event"
      collapsible
    />
  </section>

  <CollapsiblePanel
    class="section"
    title="乡镇/街道历史趋势"
    desc="合并展示当前选中乡镇的站点、充电桩、充电量和利用率历史趋势。"
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
        :title="`${selectedTownship.name}历史利用率`"
        desc="按历史充电量走势换算展示，用于观察区域负荷饱和变化。"
        :labels="scenario.mapTopic.townshipLabels"
        :primary="townshipTrendSeries.utilizationSeries"
        primary-name="利用率(%)"
        :embedded="true"
      />
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
    title="乡镇摘要"
    desc="汇总当前选中乡镇的站点、充电桩、充电量和利用率。"
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
