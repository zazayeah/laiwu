<script setup>
import * as echarts from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import CollapsiblePanel from "./CollapsiblePanel.vue";

const props = defineProps({
  title: String,
  desc: String,
  labels: {
    type: Array,
    required: true
  },
  primary: {
    type: Array,
    required: true
  },
  secondary: {
    type: Array,
    default: () => []
  },
  primaryName: {
    type: String,
    default: "当前值"
  },
  secondaryName: {
    type: String,
    default: "对比值"
  },
  smooth: {
    type: [Boolean, Number],
    default: true
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  defaultOpen: {
    type: Boolean,
    default: true
  },
  embedded: {
    type: Boolean,
    default: false
  }
});

const chartRef = ref(null);
let chart;

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  chart.setOption({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    legend: {
      top: 0,
      textStyle: { color: "#4f6480" }
    },
    grid: { left: 42, right: 18, top: 48, bottom: 36 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: props.labels,
      axisLine: { lineStyle: { color: "#d5dce8" } },
      axisLabel: { color: "#6b7f98" }
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "#ebeff5" } },
      axisLabel: { color: "#6b7f98" }
    },
    series: [
      {
        name: props.primaryName,
        type: "line",
        smooth: props.smooth,
        data: props.primary,
        symbolSize: 6,
        lineStyle: { width: 3, color: "#2f6bff" },
        itemStyle: { color: "#2f6bff" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(47,107,255,0.18)" },
            { offset: 1, color: "rgba(47,107,255,0.02)" }
          ])
        }
      },
      ...(props.secondary.length
        ? [
            {
              name: props.secondaryName,
              type: "line",
              smooth: props.smooth,
              data: props.secondary,
              symbolSize: 5,
              lineStyle: { width: 2, color: "#7aa9ff", type: "dashed" },
              itemStyle: { color: "#7aa9ff" }
            }
          ]
        : [])
    ]
  });
}

function handleResize() {
  if (chart) {
    chart.resize();
  }
}

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch(() => [props.labels, props.primary, props.secondary], renderChart, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chart) {
    chart.dispose();
  }
});
</script>

<template>
  <div v-if="embedded" class="line-chart-card-embedded">
    <div v-if="title || desc" class="panel-head">
      <div>
        <h3 class="panel-title">{{ title }}</h3>
        <div class="panel-desc">{{ desc }}</div>
      </div>
    </div>
    <div class="chart-wrap">
      <div ref="chartRef" class="chart-canvas"></div>
    </div>
  </div>
  <CollapsiblePanel
    v-else
    :title="title"
    :desc="desc"
    :collapsible="collapsible"
    :default-open="defaultOpen"
  >
    <div class="chart-wrap">
      <div ref="chartRef" class="chart-canvas"></div>
    </div>
  </CollapsiblePanel>
</template>
