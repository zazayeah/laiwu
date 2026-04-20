<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LaiwuMapSnapshot from "../components/LaiwuMapSnapshot.vue";
import LineChartCard from "../components/LineChartCard.vue";
import { predictForecast } from "../services/algorithmApi";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const mode = ref("short");
const selectedStationId = ref("");
const selectedTownshipKey = ref("");
const forecastLoading = ref(false);
const forecastResult = ref(null);
const scenario = computed(() => store.scenario);

const modeOptions = [
  { key: "short", label: "短期", scope: "region", horizon: "24h" },
  { key: "month", label: "月度", scope: "mediumLong", horizon: "month" },
  { key: "year", label: "年度", scope: "mediumLong", horizon: "year" }
];

const currentMode = computed(() => modeOptions.find((item) => item.key === mode.value) || modeOptions[0]);

function buildMonthlySeries(series = []) {
  return (series || []).map((value, index) => roundValue(Number(value || 0) * (0.92 + index * 0.03), 0));
}

function buildYearlySeries(series = []) {
  const source = series.length ? series : [300, 320, 340, 365, 390];
  const base = Number(source[source.length - 1] || source[0] || 300);
  return Array.from({ length: 5 }, (_, index) => roundValue(base * Math.pow(1.055, index), 0));
}

const totalView = computed(() => {
  const forecastViews = scenario.value.forecastViews || {};
  const loadSeries = scenario.value.loadSeries || {};
  const mediumLong = forecastViews.mediumLong || { primary: [], secondary: [] };

  if (mode.value === "month") {
    return {
      title: "莱芜地区月度负荷预测",
      labels: ["近1月", "近2月", "近3月", "近4月", "近5月", "近6月"],
      primary: buildMonthlySeries(mediumLong.primary),
      secondary: buildMonthlySeries(mediumLong.secondary)
    };
  }

  if (mode.value === "year") {
    return {
      title: "莱芜地区年度负荷预测",
      labels: ["2026", "2027", "2028", "2029", "2030"],
      primary: buildYearlySeries(mediumLong.primary),
      secondary: buildYearlySeries(mediumLong.secondary).map((item) => roundValue(item * 0.97, 0))
    };
  }

  return {
    title: "莱芜地区短期负荷预测",
    labels: loadSeries.labels || [],
    primary: loadSeries.forecast || [],
    secondary: loadSeries.actual || []
  };
});

const stationOptions = computed(() =>
  (scenario.value.stations || []).map((item) => ({
    id: item.id,
    label: item.mapLabel || item.name,
    name: item.name,
    district: item.district,
    load: Number(item.load || 0),
    use: Number(item.use || 0),
    shift: Number(item.shift || 0)
  }))
);

const townshipOptions = computed(() =>
  (scenario.value.mapTopic?.townships || [])
    .map((item) => ({
      key: item.key,
      label: item.name,
      district: item.district,
      energySeries: item.energySeries || [],
      pileSeries: item.pileSeries || [],
      utilization: Number(item.utilization || 0),
      recommendation: item.recommendation,
      reason: item.reason,
      latestEnergy: Number(item.energySeries?.[item.energySeries.length - 1] || 0),
      latestPileCount: Number(item.pileSeries?.[item.pileSeries.length - 1] || 0)
    }))
    .sort((a, b) => b.latestEnergy - a.latestEnergy)
);

const selectedStation = computed(
  () => stationOptions.value.find((item) => item.id === selectedStationId.value) || stationOptions.value[0] || null
);

const selectedTownship = computed(
  () => townshipOptions.value.find((item) => item.key === selectedTownshipKey.value) || townshipOptions.value[0] || null
);

const totalStationLoad = computed(() =>
  stationOptions.value.reduce((sum, item) => sum + Number(item.load || 0), 0) || 1
);

const totalTownshipEnergy = computed(() =>
  townshipOptions.value.reduce((sum, item) => sum + Number(item.latestEnergy || 0), 0) || 1
);

function roundValue(value, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function waveFactor(index, phase = 0, amplitude = 0.08) {
  const primary = Math.sin((index + phase) * 0.92) * amplitude;
  const secondary = Math.cos((index + phase) * 0.47) * amplitude * 0.42;
  return 1 + primary + secondary;
}

function scaleSeries(series, factor, options = {}) {
  const { phase = 0, amplitude = 0.08, floor = 0.1, decimals = 1 } = options;
  return (series || []).map((value, index) =>
    roundValue(Math.max(floor, Number(value || 0) * factor * waveFactor(index, phase, amplitude)), decimals)
  );
}

function getPeakInfo(labels = [], series = []) {
  if (!series.length) {
    return { value: "--", label: "--" };
  }
  const maxValue = Math.max(...series);
  const maxIndex = series.findIndex((item) => item === maxValue);
  return {
    value: maxValue,
    label: labels[maxIndex] || "--"
  };
}

const stationForecastView = computed(() => {
  const station = selectedStation.value;
  if (!station) {
    return { labels: [], primary: [], secondary: [] };
  }

  const base = totalView.value;
  const weight = station.load / totalStationLoad.value;

  if (mode.value !== "short") {
    const factor = weight * (1.02 + station.shift / 150);
    return {
      title: `${station.name}${mode.value === "month" ? "月度" : "年度"}负荷预测`,
      labels: base.labels,
      primary: scaleSeries(base.primary, factor, { phase: 0.35, amplitude: 0.05, decimals: 0 }),
      secondary: scaleSeries(base.secondary, factor * 0.96, { phase: 0.75, amplitude: 0.04, decimals: 0 })
    };
  }

  const factor = weight * (0.94 + station.use / 260);
  return {
    title: `${station.name}负荷预测`,
    labels: base.labels,
    primary: scaleSeries(base.primary, factor, { phase: 0.28, amplitude: 0.09 }),
    secondary: scaleSeries(base.secondary, factor * 0.97, { phase: 0.68, amplitude: 0.07 })
  };
});

const townshipForecastView = computed(() => {
  const township = selectedTownship.value;
  if (!township) {
    return { labels: [], primary: [], secondary: [] };
  }

  if (mode.value !== "short") {
    return {
      title: `${township.label}${mode.value === "month" ? "月度" : "年度"}负荷预测`,
      labels: totalView.value.labels,
      primary: scaleSeries(totalView.value.primary, township.latestEnergy / totalTownshipEnergy.value * 1.18, {
        phase: 0.38,
        amplitude: 0.06,
        decimals: 0
      }),
      secondary: scaleSeries(totalView.value.secondary, township.latestEnergy / totalTownshipEnergy.value * 1.12, {
        phase: 0.74,
        amplitude: 0.05,
        decimals: 0
      })
    };
  }

  const weight = township.latestEnergy / totalTownshipEnergy.value;
  const factor = weight * (0.9 + township.utilization / 240);
  return {
    title: `${township.label}负荷预测`,
    labels: totalView.value.labels,
    primary: scaleSeries(totalView.value.primary, factor, { phase: 0.42, amplitude: 0.1 }),
    secondary: scaleSeries(totalView.value.secondary, factor * 0.96, { phase: 0.88, amplitude: 0.08 })
  };
});

const totalPeak = computed(() => getPeakInfo(totalView.value.labels, totalView.value.primary));
const stationPeak = computed(() =>
  getPeakInfo(stationForecastView.value.labels, stationForecastView.value.primary)
);
const townshipPeak = computed(() =>
  getPeakInfo(townshipForecastView.value.labels, townshipForecastView.value.primary)
);

const forecastHighlights = computed(() => [
  {
    label: "当前尺度",
    title: currentMode.value.label,
    desc:
      currentMode.value.key === "short"
        ? "面向未来24小时滚动预测。"
        : currentMode.value.key === "month"
          ? "面向未来6个月月度滚动研判。"
          : "面向未来5年年度趋势研判。"
  },
  {
    label: "预测维度",
    title: "区域 + 站点 + 乡镇街道",
    desc: `当前聚焦 ${selectedStation.value?.label || "--"} 与 ${selectedTownship.value?.label || "--"} 两级对象。`
  },
  {
    label: "当前状态",
    title: forecastState.value,
    desc: `MAPE ${forecastAccuracy.value.mape} / RMSE ${forecastAccuracy.value.rmse}`
  }
]);

const forecastAiNotes = computed(() => [
  {
    label: "输入因子",
    title: "负荷 + 天气 + 日期类型 + 电价 + 站点状态",
    desc: "融合历史负荷、实时站点运行、电价分段、天气及工作日/节假日标签，形成统一预测特征。"
  },
  {
    label: "预测分层",
    title: "莱芜总量 + 站点 + 乡镇街道",
    desc:
      currentMode.value.key === "short"
        ? "先做区域短期滚动预测，再拆解到重点场站和乡镇街道，支撑调度与群控。"
        : currentMode.value.key === "month"
          ? "先形成区域月度趋势，再下钻到重点站点和乡镇街道的月度变化。"
          : "先形成区域年度增长趋势，再下钻到站点和乡镇街道的年度演进。"
  },
  {
    label: "结果用途",
    title: "预警分流 + 群控调度 + 接入规划",
    desc: "既服务短周期负荷调度，也服务重点站点负荷观察和乡镇接入规划判断。"
  }
]);

const stationMetrics = computed(() => {
  const station = selectedStation.value;
  const peak = stationPeak.value;
  if (!station) return [];
  return [
    {
      label: "所属区域",
      value: station.district,
      desc: "站点当前归属区域"
    },
    {
      label: "预测峰值",
      value: `${peak.value}${mode.value === "short" ? " MW" : " MWh"}`,
      desc: `峰值时段 ${peak.label}`
    },
    {
      label: "当前负荷状态",
      value: `${station.use}%`,
      desc: `${station.load} MW 当前站点负荷`
    }
  ];
});

const townshipMetrics = computed(() => {
  const township = selectedTownship.value;
  const peak = townshipPeak.value;
  if (!township) return [];
  return [
    {
      label: "所属区域",
      value: township.district,
      desc: "乡镇街道所属区划"
    },
    {
      label: "预测峰值",
      value: `${peak.value}${mode.value === "short" ? " MW" : " MWh"}`,
      desc: `峰值时段 ${peak.label}`
    },
    {
      label: "现有充电桩",
      value: `${township.latestPileCount} 个`,
      desc: township.recommendation || "用于接入规划判断"
    }
  ];
});

watch(
  () => store.scenarioKey,
  () => {
    mode.value = "short";
  }
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
  townshipOptions,
  (items) => {
    if (!items.some((item) => item.key === selectedTownshipKey.value)) {
      selectedTownshipKey.value = items[0]?.key || "";
    }
  },
  { immediate: true }
);

watch(
  [() => store.scenarioKey, mode],
  async () => {
    const current = modeOptions.find((item) => item.key === mode.value) || modeOptions[0];
    forecastLoading.value = true;
    try {
      forecastResult.value = await predictForecast({
        scenarioKey: store.scenarioKey,
        scope: current.scope,
        horizon: current.horizon,
        scenario: scenario.value
      });
    } finally {
      forecastLoading.value = false;
    }
  },
  { immediate: true }
);

const forecastState = computed(() =>
  forecastLoading.value ? "算法计算中" : forecastResult.value?.status === "OK" ? "算法接口结果" : "本地回退结果"
);

const forecastAccuracy = computed(() => forecastResult.value?.accuracy || { mape: "--", rmse: "--" });
</script>

<template>
  <section class="panel section">
    <div class="panel-head">
      <div>
        <h3 class="panel-title">预测尺度切换</h3>
        <div class="panel-desc">统一切换短期、月度、年度三类预测口径，下面三层视图同步联动。</div>
        <div class="muted">当前状态：{{ forecastState }}</div>
      </div>
      <div class="tabs">
        <button
          v-for="item in modeOptions"
          :key="item.key"
          class="tab-btn"
          :class="{ active: item.key === mode }"
          @click="mode = item.key"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </section>

  <CollapsiblePanel
    class="section"
    title="莱芜总负荷预测"
    desc="展示莱芜地区整体充电负荷在当前预测尺度下的滚动结果。"
  >
    <div class="forecast-sub-metrics">
      <div class="card-grid">
        <div class="stat-card compact-info-card">
          <div class="label">预测峰值</div>
          <div class="value">{{ totalPeak.value }}</div>
          <div class="muted">{{ totalPeak.label }} 出现峰值</div>
        </div>
        <div class="stat-card compact-info-card">
          <div class="label">结果口径</div>
          <div class="value" style="font-size:22px;">{{ currentMode.label }}</div>
          <div class="muted">覆盖区域、站点与乡镇街道三层预测</div>
        </div>
        <div class="stat-card compact-info-card">
          <div class="label">输出对象</div>
          <div class="value" style="font-size:22px;">莱芜地区</div>
          <div class="muted">用于总量监测与预警判断</div>
        </div>
      </div>
    </div>
    <LineChartCard
      embedded
      :title="totalView.title"
      desc="切换不同预测尺度后，总负荷曲线同步变化。"
      :labels="totalView.labels"
      :primary="totalView.primary"
      :secondary="totalView.secondary"
      :smooth="0.16"
      primary-name="预测值"
      secondary-name="对比基线"
    />
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="站点负荷预测"
    desc="支持重点充电站切换，查看不同站点在当前尺度下的预测负荷变化。"
  >
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
    <div class="forecast-sub-metrics">
      <div class="card-grid">
        <div v-for="item in stationMetrics" :key="item.label" class="stat-card compact-info-card">
          <div class="label">{{ item.label }}</div>
          <div class="value" style="font-size:22px;">{{ item.value }}</div>
          <div class="muted">{{ item.desc }}</div>
        </div>
      </div>
    </div>
    <LineChartCard
      embedded
      :title="stationForecastView.title"
      desc="站点维度下展示当前选中充电站的预测负荷与对比基线。"
      :labels="stationForecastView.labels"
      :primary="stationForecastView.primary"
      :secondary="stationForecastView.secondary"
      :smooth="0.14"
      primary-name="站点预测值"
      secondary-name="站点基线"
    />
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="乡镇/街道负荷预测"
    desc="支持乡镇街道切换，查看不同接入区域的负荷趋势与接入规模变化。"
  >
    <div class="tabs single-line-tabs forecast-selector">
      <button
        v-for="item in townshipOptions"
        :key="item.key"
        class="tab-btn"
        :class="{ active: item.key === selectedTownshipKey }"
        @click="selectedTownshipKey = item.key"
      >
        {{ item.label }}
      </button>
    </div>
    <div class="forecast-sub-metrics">
      <div class="card-grid">
        <div v-for="item in townshipMetrics" :key="item.label" class="stat-card compact-info-card">
          <div class="label">{{ item.label }}</div>
          <div class="value" style="font-size:22px;">{{ item.value }}</div>
          <div class="muted">{{ item.desc }}</div>
        </div>
      </div>
    </div>
    <LineChartCard
      embedded
      :title="townshipForecastView.title"
      desc="乡镇街道维度下展示当前选中区域的预测负荷与对比基线。"
      :labels="townshipForecastView.labels"
      :primary="townshipForecastView.primary"
      :secondary="townshipForecastView.secondary"
      :smooth="0.12"
      primary-name="区域预测值"
      secondary-name="区域基线"
    />
  </CollapsiblePanel>

  <section class="section">
    <LaiwuMapSnapshot
      title="预测空间分布参考"
      desc="在预测页面同步展示莱芜真实地图和重点站点分布，便于理解预测结果的空间落点。"
      :show-station-labels="false"
      :interactive-legend="false"
      side-mode="forecast"
      :districts="scenario.mapTopic.districts"
      :stations="scenario.stations"
      collapsible
    />
  </section>

  <CollapsiblePanel
    class="section"
    title="预测结果摘要"
    desc="保留当前尺度、预测维度和结果状态三项核心信息。"
  >
    <div class="triple-grid">
      <div v-for="item in forecastHighlights" :key="item.label" class="info-card">
        <div class="label">{{ item.label }}</div>
        <strong>{{ item.title }}</strong>
        <p class="muted">{{ item.desc }}</p>
      </div>
    </div>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="精度与来源"
    desc="汇总当前预测结果的误差指标和来源状态。"
  >
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">MAPE</div>
        <div class="value">{{ forecastAccuracy.mape }}</div>
        <div class="muted">预测误差控制指标</div>
      </div>
      <div class="stat-card">
        <div class="label">RMSE</div>
        <div class="value">{{ forecastAccuracy.rmse }}</div>
        <div class="muted">波动拟合稳定性指标</div>
      </div>
      <div class="stat-card">
        <div class="label">结果来源</div>
        <div class="value" style="font-size:22px;">{{ forecastState }}</div>
        <div class="muted">无接口时自动使用本地回退结果</div>
      </div>
    </div>
  </CollapsiblePanel>

  <CollapsiblePanel
    class="section"
    title="AI技术说明"
    desc="说明预测页当前使用的输入因子、分层方法和输出结果，便于汇报时解释模型逻辑。"
  >
    <div class="triple-grid">
      <div v-for="item in forecastAiNotes" :key="item.label" class="info-card">
        <div class="label">{{ item.label }}</div>
        <strong>{{ item.title }}</strong>
        <p class="muted">{{ item.desc }}</p>
      </div>
    </div>
  </CollapsiblePanel>
</template>
