<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LineChartCard from "../components/LineChartCard.vue";
import { evaluateFlexibility } from "../services/algorithmApi";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const selectedStationId = ref("");
const adjustableSpace = ref(10);
const priceGap = ref(0.82);
const evaluationLoading = ref(false);
const evaluationResult = ref(null);
const scenario = computed(() => store.scenario);
let timerId;

const stationOptions = computed(() =>
  (scenario.value.stations || []).map((item) => ({
    id: item.id,
    label: item.mapLabel || item.name,
    name: item.name,
    district: item.district,
    load: Number(item.load || 0),
    use: Number(item.use || 0),
    shift: Number(item.shift || 0),
    status: item.status || "平稳运行",
    fast: Number(item.fast || 0),
    slow: Number(item.slow || 0)
  }))
);

const selectedStation = computed(
  () => stationOptions.value.find((item) => item.id === selectedStationId.value) || stationOptions.value[0] || null
);

function average(list, start, end) {
  const values = list.slice(start, end);
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function getServiceGuardFromSpace(space) {
  return Math.max(80, Math.min(98, 100 - Number(space)));
}

function buildFlexOutcome(currentScenario, station, space, spread) {
  const stationLoad = Number(station?.load || 2.6);
  const stationUse = Number(station?.use || 58);
  const stationShift = Number(station?.shift || 4);
  const baseFactor = 0.22 + stationLoad / 10 + stationUse / 320;
  const baseline = [
    average(currentScenario.loadSeries.forecast, 0, 4),
    average(currentScenario.loadSeries.forecast, 4, 8),
    average(currentScenario.loadSeries.forecast, 8, 12),
    average(currentScenario.loadSeries.forecast, 12, 16),
    average(currentScenario.loadSeries.forecast, 16, 20),
    average(currentScenario.loadSeries.forecast, 20, 24)
  ]
    .map((item, index) => {
      const wave = 1 + Math.sin((index + stationShift / 2) * 0.95) * 0.08;
      return Number((item * baseFactor * wave).toFixed(1));
    });

  const serviceGuard = getServiceGuardFromSpace(space);
  const stationWeight = 0.55 + stationLoad / 8 + stationShift / 30;
  const shiftable = Math.max(0.6, (26 - (serviceGuard - 80) * 0.8) * stationWeight * 0.18);
  const cuttable = Math.max(0.2, shiftable / 7 + spread * 0.32 + stationUse / 220);
  const revenue = Number((shiftable * spread * 0.026).toFixed(2));
  const optimized = baseline.map((item, index) => {
    if (index === 0 || index === 3) return Number((item + shiftable * 0.16).toFixed(1));
    if (index === 4 || index === 5) return Number((item - cuttable * 0.75).toFixed(1));
    return item;
  });

  return {
    baseline,
    optimized,
    shiftable: Number(shiftable.toFixed(1)),
    cuttable: Number(cuttable.toFixed(1)),
    revenue,
    serviceGuard
  };
}

const serviceGuarantee = computed(() => getServiceGuardFromSpace(adjustableSpace.value));

async function loadEvaluation() {
  evaluationLoading.value = true;
  try {
    evaluationResult.value = await evaluateFlexibility({
      scenarioKey: store.scenarioKey,
      stationId: selectedStation.value?.id,
      serviceGuard: serviceGuarantee.value,
      priceSpread: priceGap.value,
      scenario: scenario.value
    });
  } finally {
    evaluationLoading.value = false;
  }
}

watch(
  [() => store.scenarioKey, selectedStationId, adjustableSpace, priceGap],
  () => {
    clearTimeout(timerId);
    timerId = setTimeout(loadEvaluation, 120);
  },
  { immediate: true }
);

watch(
  stationOptions,
  (items) => {
    if (!items.some((item) => item.id === selectedStationId.value)) {
      selectedStationId.value = items[0]?.id || "";
    }
  },
  { immediate: true }
);

watch(
  () => store.scenarioKey,
  () => {
    adjustableSpace.value = 10;
  }
);

onBeforeUnmount(() => {
  clearTimeout(timerId);
});

const localFlexData = computed(() =>
  buildFlexOutcome(scenario.value, selectedStation.value, adjustableSpace.value, priceGap.value)
);

const flexData = computed(() => {
  return {
    baseline: localFlexData.value.baseline,
    optimized: localFlexData.value.optimized,
    labels: ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"],
    shiftable: localFlexData.value.shiftable,
    cuttable: localFlexData.value.cuttable,
    revenue: Number(localFlexData.value.revenue.toFixed(2)),
    recommendations: ["午间增充", "夜谷预约", "峰段降功率"]
  };
});

const strategyRows = computed(() => [
  {
    name: flexData.value.recommendations[0] || "午间增充",
    desc: `优先在 ${selectedStation.value?.name || "当前站点"} 释放午间和低谷时段充电名额，承接可延后订单。`,
    value: `${(flexData.value.shiftable * 0.36).toFixed(1)} MWh`
  },
  {
    name: flexData.value.recommendations[1] || "夜谷预约",
    desc: "将长途与低时效订单向夜谷窗口平移，降低站点晚高峰并发压力。",
    value: `${(flexData.value.shiftable * 0.31).toFixed(1)} MWh`
  },
  {
    name: flexData.value.recommendations[2] || "峰段降功率",
    desc: "对持续驻留车辆实施分档控功率，削减站点晚高峰瞬时负荷。",
    value: `${(flexData.value.cuttable * 0.58).toFixed(1)} MW`
  }
]);

const summaryText = computed(() => {
  const stationName = selectedStation.value?.name || "当前站点";
  return `${stationName}当前按“保底服务 ${serviceGuarantee.value}% + 弹性调节 ${adjustableSpace.value}%”口径测算，可将一部分充电任务从高价时段转移到低价时段，并在晚高峰临时下调部分充电功率。`;
});

const coreMetricCards = computed(() => [
  {
    label: "可错峰电量",
    value: flexData.value.shiftable.toFixed(1),
    unit: "MWh",
    desc: "今天可从高价时段转移到低价时段的电量"
  },
  {
    label: "高峰可降负荷",
    value: flexData.value.cuttable.toFixed(1),
    unit: "MW",
    desc: "晚高峰时段可临时压降的负荷能力"
  },
  {
    label: "预计节省电费",
    value: flexData.value.revenue.toFixed(2),
    unit: "万元",
    desc: "按当前固定购电价差测算的单日收益"
  }
]);

const adjustmentExplainRows = computed(() => [
  {
    label: "这次能调多少",
    title: `${adjustableSpace.value}% 订单可参与错峰调整`,
    desc: `保留 ${serviceGuarantee.value}% 订单按原计划执行，其余订单可在 ${selectedStation.value?.name || "当前站点"} 参与移峰填谷。`
  },
  {
    label: "主要怎么调",
    title: "午间增充 + 夜谷预约 + 峰段降功率",
    desc: "优先把可延后订单移到低价时段，并在晚高峰对部分车辆实施柔性降功率。"
  },
  {
    label: "最终能带来什么",
    title: `${selectedStation.value?.label || "当前站点"}单日预计节省 ${flexData.value.revenue.toFixed(2)} 万元`,
    desc: "节省金额主要取决于可错峰电量、高峰压降能力和当前购电价差。"
  }
]);

const revenueComparison = computed(() => {
  const conservative = buildFlexOutcome(
    scenario.value,
    selectedStation.value,
    Math.max(2, adjustableSpace.value - 4),
    priceGap.value
  );
  const current = buildFlexOutcome(scenario.value, selectedStation.value, adjustableSpace.value, priceGap.value);
  const active = buildFlexOutcome(
    scenario.value,
    selectedStation.value,
    Math.min(20, adjustableSpace.value + 4),
    priceGap.value
  );
  return [
    {
      label: "偏保守调节",
      value: `${Math.max(2, adjustableSpace.value - 4)}%`,
      revenue: `${conservative.revenue.toFixed(2)} 万元`,
      desc: `可平移 ${conservative.shiftable.toFixed(1)} MWh`
    },
    {
      label: "当前方案",
      value: `${adjustableSpace.value}%`,
      revenue: `${current.revenue.toFixed(2)} 万元`,
      desc: `可平移 ${current.shiftable.toFixed(1)} MWh`
    },
    {
      label: "积极调节",
      value: `${Math.min(20, adjustableSpace.value + 4)}%`,
      revenue: `${active.revenue.toFixed(2)} 万元`,
      desc: `可平移 ${active.shiftable.toFixed(1)} MWh`
    }
  ];
});

const evaluationState = computed(() =>
  evaluationLoading.value ? "算法计算中" : evaluationResult.value?.status === "OK" ? "算法接口结果" : "本地回退结果"
);

const stationSummaryCards = computed(() => {
  const station = selectedStation.value;
  if (!station) return [];
  return [
    { label: "所属区域", value: station.district, desc: "当前分析站点区划" },
    { label: "当前负荷", value: `${station.load.toFixed(1)} MW`, desc: station.status },
    { label: "当前承载状态", value: `${station.use}%`, desc: "站点当前负荷水平" },
    { label: "现有充电桩", value: `${station.fast + station.slow} 个`, desc: `${station.fast}快 ${station.slow}慢` }
  ];
});
</script>

<template>
  <section class="section">
    <CollapsiblePanel :collapsible="false">
      <template #header>
        <div>
          <h3 class="panel-title">调节空间设定</h3>
          <div class="panel-desc">按供电站维度开展调节潜力分析，可切换不同站点查看可平移电量、削峰能力和收益变化。</div>
          <div class="muted">当前状态：{{ evaluationState }}</div>
        </div>
      </template>
      <div class="tabs single-line-tabs forecast-selector">
        <button
          v-for="item in stationOptions"
          :key="item.id"
          class="tab-btn"
          :class="{ active: item.id === selectedStationId }"
          @click="selectedStationId = item.id"
        >
          {{ item.label }}
        </button>
      </div>
      <div class="card-grid" style="margin-bottom:18px;">
        <div v-for="item in stationSummaryCards" :key="item.label" class="stat-card compact-info-card">
          <div class="label">{{ item.label }}</div>
          <div class="value" style="font-size:22px;">{{ item.value }}</div>
          <div class="muted">{{ item.desc }}</div>
        </div>
      </div>
      <div class="range-group">
        <div class="range-card">
          <header><span>可调节空间</span><strong>{{ adjustableSpace }}%</strong></header>
          <input v-model="adjustableSpace" type="range" min="2" max="20" step="1" />
        </div>
        <div class="range-card">
          <header><span>购电价差假设（不可调整）</span><strong>{{ priceGap.toFixed(2) }} 元/kWh</strong></header>
          <input :value="priceGap" type="range" min="0.4" max="1.2" step="0.02" disabled />
          <div class="muted">当前按固定价差口径测算收益，不开放页面调整。</div>
        </div>
      </div>
      <div class="muted" style="margin-top:12px;">
        {{ summaryText }}
      </div>
      <div class="card-grid" style="margin-top:18px;">
        <div v-for="item in coreMetricCards" :key="item.label" class="stat-card">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}</div>
          <div class="muted">{{ item.unit }} · {{ item.desc }}</div>
        </div>
      </div>
    </CollapsiblePanel>
  </section>

  <CollapsiblePanel
    class="section"
    title="调节执行说明"
    desc="解释当前站点在现有参数下如何调整、优先调哪些时段，以及调节空间放大后收益会如何变化。"
  >
    <section class="dual-grid" style="margin-top:0;">
      <div>
        <div class="label" style="margin-bottom:12px;">如何调整</div>
        <div class="list">
          <div v-for="item in adjustmentExplainRows" :key="item.label" class="info-card">
            <div class="label">{{ item.label }}</div>
            <strong>{{ item.title }}</strong>
            <p class="muted">{{ item.desc }}</p>
          </div>
        </div>
        <div class="label" style="margin:18px 0 12px;">执行动作</div>
        <div class="notes">
          <div v-for="item in strategyRows" :key="item.name" class="list-row">
            <strong>{{ item.name }}</strong>
            <span class="muted">{{ item.desc }}</span>
            <span>{{ item.value }}</span>
          </div>
        </div>
      </div>

      <div>
        <div class="label" style="margin-bottom:12px;">收益变化</div>
        <div class="card-grid">
          <div v-for="item in revenueComparison" :key="item.label" class="stat-card">
            <div class="label">{{ item.label }}</div>
            <div class="value" style="font-size:22px;">{{ item.revenue }}</div>
            <div class="muted">{{ item.value }} 可调节空间 · {{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>

  <LineChartCard
    :title="`${selectedStation?.name || '当前站点'}调节前后负荷曲线`"
    desc="展示当前选中站点基线负荷与调节后负荷的差异，用于支撑潜力评估和经济性分析。"
    :labels="flexData.labels"
    :primary="flexData.optimized"
    :secondary="flexData.baseline"
    primary-name="调节后"
    secondary-name="基线"
    collapsible
  />
</template>
