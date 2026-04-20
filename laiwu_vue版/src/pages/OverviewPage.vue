<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuMapSnapshot from "../components/LaiwuMapSnapshot.vue";
import LaiwuTownshipStationSnapshot from "../components/LaiwuTownshipStationSnapshot.vue";
import MetricGrid from "../components/MetricGrid.vue";
import LineChartCard from "../components/LineChartCard.vue";
import { modules } from "../data/dashboard";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const scenario = computed(() => store.scenario);
const subModules = computed(() => modules.filter((item) => item.key !== "overview"));
</script>

<template>
  <MetricGrid :items="scenario.metrics" />

  <LaiwuTownshipStationSnapshot
    class="overview-map-hero"
    title="莱芜乡镇/街道充电站数量分区图"
    desc="按乡镇/街道统计现有充电站数量，以红黄绿三色反映布点覆盖差异，支撑区域新增站点研判。"
    :stations="scenario.stations"
    :townships="scenario.mapTopic.townships"
    collapsible
  />

  <LaiwuMapSnapshot
    class="overview-map-hero"
    title="莱芜站点使用情况三色图"
    desc="按充电站充电桩使用率展示绿色低负荷、黄色中负荷、红色高负荷，重点体现各站点当前负荷状态。"
    :show-station-labels="true"
    :interactive-legend="true"
    side-mode="stations"
    :districts="scenario.mapTopic.districts"
    :stations="scenario.stations"
    collapsible
  />

  <CollapsiblePanel
    class="section"
    title="负荷趋势与策略摘要"
    desc="合并展示24小时负荷趋势、价格窗口和当前策略动作。"
  >
    <section class="dual-grid" style="margin-top:0;">
      <LineChartCard
        title="24小时负荷趋势与价格窗口"
        desc="总览页保留全局趋势，用于快速感知当前场景下的负荷变化和预测峰值。"
        :labels="scenario.loadSeries.labels"
        :primary="scenario.loadSeries.forecast"
        :secondary="scenario.loadSeries.actual"
        primary-name="滚动预测"
        secondary-name="实际负荷"
        :embedded="true"
      />

      <div>
        <div class="label" style="margin-bottom:12px;">当前策略摘要</div>
        <div class="list">
          <div v-for="item in scenario.strategies" :key="item.name" class="info-card">
            <div class="label">{{ item.level }}</div>
            <strong>{{ item.name }}</strong>
            <p class="muted">{{ item.action }}</p>
            <div class="tag">{{ item.gain }}</div>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="滚动预警与重点站点"
    desc="合并展示当前场景下的关键预警与重点站点状态。"
  >
    <section class="dual-grid" style="margin-top:0;">
      <div>
        <div class="label" style="margin-bottom:12px;">滚动预警摘要</div>
        <div class="list">
          <div v-for="item in scenario.alerts" :key="item.time + item.title" class="info-card">
            <div class="label">{{ item.time }}</div>
            <strong>{{ item.title }}</strong>
            <p class="muted">{{ item.text }}</p>
          </div>
        </div>
      </div>

      <div>
        <div class="label" style="margin-bottom:12px;">重点站点概览</div>
        <div class="notes">
          <div v-for="station in scenario.stations" :key="station.id" class="list-row">
            <strong>{{ station.name }}</strong>
            <div class="bar-track"><span class="bar-fill" :style="{ width: `${station.use}%` }"></span></div>
            <span>{{ station.load }} MW / 利用率 {{ station.use }}%</span>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <CollapsiblePanel
    title="模块入口"
    desc="保留各专题模块入口，便于从总览页跳转。"
  >
    <section class="module-grid">
      <RouterLink v-for="item in subModules" :key="item.key" :to="item.path" class="module-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </RouterLink>
    </section>
  </CollapsiblePanel>
</template>
