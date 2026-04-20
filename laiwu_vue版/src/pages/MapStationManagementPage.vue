<script setup>
import { computed } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuMapPanel from "../components/LaiwuMapPanel.vue";
import MetricGrid from "../components/MetricGrid.vue";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const scenario = computed(() => store.scenario);

function getLoadLabel(use) {
  if (use >= 85) return "红色高负荷";
  if (use >= 70) return "黄色中负荷";
  return "绿色低负荷";
}

function getLoadTone(use) {
  if (use >= 85) return "danger";
  if (use >= 70) return "warning";
  return "safe";
}

const stationMetrics = computed(() => {
  const stations = scenario.value.stations;
  const piles = stations.reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
  return [
    { label: "管理站点", value: String(stations.length), unit: "座", sub: "接入地图台账管理" },
    { label: "充电桩数量", value: String(piles), unit: "个", sub: "快充与慢充汇总" },
    { label: "黄色中负荷", value: String(stations.filter((item) => item.use >= 70 && item.use < 85).length), unit: "座", sub: "需持续关注负荷变化" },
    { label: "红色高负荷", value: String(stations.filter((item) => item.use >= 85).length), unit: "座", sub: "需关注排队与峰值负荷" }
  ];
});

const stationRows = computed(() =>
  [...scenario.value.stations].sort((a, b) => b.use - a.use).map((item) => ({
    ...item,
    pileCount: (item.fast || 0) + (item.slow || 0),
    loadLabel: getLoadLabel(item.use),
    tone: getLoadTone(item.use)
  }))
);
</script>

<template>
  <CollapsiblePanel
    class="section"
    title="管理站点概况"
    desc="汇总当前接入站点数量、充电桩规模及中高负荷站点情况。"
  >
    <MetricGrid :items="stationMetrics" />
  </CollapsiblePanel>

  <section class="section">
    <LaiwuMapPanel
      :districts="scenario.mapTopic.districts"
      :stations="scenario.stations"
      collapsible
    />
  </section>

  <CollapsiblePanel
    class="section"
    title="充电站台账与使用状态"
    desc="按站点展示充电桩数量、使用率、当前负荷和运行属性，用于地图化站点管理。"
  >
    <div class="map-side-table">
      <div class="table-row header compact-table-row station-management-cols">
        <span>站点名称</span>
        <span>行政区</span>
        <span>负荷状态</span>
        <span>充电桩</span>
        <span>使用率</span>
        <span>当前负荷</span>
      </div>
      <div v-for="item in stationRows" :key="item.id" class="table-row compact-table-row station-management-cols">
        <strong>{{ item.name }}</strong>
        <span>{{ item.district }}</span>
        <span class="tag" :class="item.tone">{{ item.loadLabel }}</span>
        <span>{{ item.pileCount }} 个</span>
        <span>{{ item.use }}%</span>
        <span>{{ item.load }} MW</span>
      </div>
    </div>
  </CollapsiblePanel>
</template>

<style scoped>
.station-management-cols {
  grid-template-columns: minmax(0, 2.2fr) repeat(5, minmax(88px, 1fr));
}

.station-management-cols > :not(:first-child) {
  justify-self: center;
  text-align: center;
}

.station-management-cols > :first-child {
  min-width: 0;
}

.station-management-cols .tag {
  justify-self: center;
}

@media (max-width: 1200px) {
  .station-management-cols {
    grid-template-columns: minmax(0, 1.8fr) repeat(5, minmax(76px, 1fr));
  }
}
</style>
