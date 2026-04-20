<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuGeoJson from "../assets/maps/laiwu-city-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";
import { getStatusTone } from "../data/dashboard";

const props = defineProps({
  title: {
    type: String,
    default: "莱芜地图概览"
  },
  desc: {
    type: String,
    default: "展示莱芜区、钢城区及重点站点空间分布。"
  },
  showStationLabels: {
    type: Boolean,
    default: false
  },
  interactiveLegend: {
    type: Boolean,
    default: false
  },
  sideMode: {
    type: String,
    default: "summary"
  },
  districts: {
    type: Array,
    required: true
  },
  stations: {
    type: Array,
    required: true
  },
  collapsible: {
    type: Boolean,
    default: false
  },
  defaultOpen: {
    type: Boolean,
    default: true
  }
});

const chartRef = ref(null);
const activeTone = ref("");
const blinkPhase = ref(true);
let blinkTimer;
let chart;
const cityFeatures = laiwuGeoJson.features || [];

const toneColors = {
  safe: "#44b879",
  warning: "#e5a623",
  danger: "#df5b57"
};

const areaColors = {
  safe: "#dff4e7",
  warning: "#fff1d6",
  danger: "#fde2e2"
};

const loadStatus = {
  safe: {
    label: "绿色低负荷",
    desc: "充电桩使用率较低，站点运行平稳"
  },
  warning: {
    label: "黄色中负荷",
    desc: "充电桩使用率中等，需持续关注负荷变化"
  },
  danger: {
    label: "红色高负荷",
    desc: "充电桩使用率较高，需关注排队与峰值负荷"
  }
};

const districtView = computed(() =>
  props.districts.map((item) => ({
    ...item,
    tone: getStatusTone(item.utilization),
    zoneLabel: loadStatus[getStatusTone(item.utilization)].label,
    advice: loadStatus[getStatusTone(item.utilization)].desc
  }))
);

const stationView = computed(() =>
  props.stations.map((item) => ({
    ...item,
    tone: getStatusTone(item.use),
    zoneLabel: loadStatus[getStatusTone(item.use)].label,
    advice: loadStatus[getStatusTone(item.use)].desc
  }))
);

const legend = [
  { key: "safe", label: loadStatus.safe.label },
  { key: "warning", label: loadStatus.warning.label },
  { key: "danger", label: loadStatus.danger.label }
];

const zoneStats = computed(() => [
  {
    key: "safe",
    label: loadStatus.safe.label,
    count: stationView.value.filter((item) => item.tone === "safe").length,
    desc: loadStatus.safe.desc
  },
  {
    key: "warning",
    label: loadStatus.warning.label,
    count: stationView.value.filter((item) => item.tone === "warning").length,
    desc: loadStatus.warning.desc
  },
  {
    key: "danger",
    label: loadStatus.danger.label,
    count: stationView.value.filter((item) => item.tone === "danger").length,
    desc: loadStatus.danger.desc
  }
]);

const focusSummary = computed(() => {
  const focus = [...stationView.value].sort((a, b) => b.use - a.use)[0];
  return focus ? `${focus.name} · ${focus.zoneLabel}` : "暂无站点数据";
});

const districtSummary = computed(() => [...districtView.value].sort((a, b) => b.utilization - a.utilization));
const focusStations = computed(() => [...stationView.value].sort((a, b) => b.use - a.use).slice(0, 2));
const forecastDistricts = computed(() =>
  districtSummary.value.map((item) => ({
    ...item,
    hint: `预测负荷 ${item.energy} MWh，${item.advice}`
  }))
);
const forecastStations = computed(() =>
  focusStations.value.map((item) => ({
    ...item,
    hint: `预测关注站点 · 利用率 ${item.use}%`
  }))
);
const decisionDistricts = computed(() =>
  districtSummary.value.map((item) => ({
    ...item,
    hint: item.advice
  }))
);
const decisionStations = computed(() =>
  focusStations.value.map((item) => ({
    ...item,
    hint: `${item.zoneLabel} · 当前负荷 ${item.load} MW`
  }))
);
const stationDetails = computed(() =>
  [...stationView.value]
    .sort((a, b) => b.use - a.use)
    .map((item) => ({
      ...item,
      hint: `${item.sceneType || "站点运行"} · ${item.advice}`
    }))
);

function extractGeometryPoints(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function getBounds(points) {
  return points.reduce(
    (acc, [lng, lat]) => ({
      minLng: Math.min(acc.minLng, lng),
      maxLng: Math.max(acc.maxLng, lng),
      minLat: Math.min(acc.minLat, lat),
      maxLat: Math.max(acc.maxLat, lat)
    }),
    {
      minLng: Infinity,
      maxLng: -Infinity,
      minLat: Infinity,
      maxLat: -Infinity
    }
  );
}

const fullMapBounds = (() => {
  const points = cityFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

function getMapFocus() {
  if (!activeTone.value) {
    return { center: undefined, zoom: 1 };
  }

  const focusStations = stationView.value.filter((item) => item.tone === activeTone.value);
  if (!focusStations.length) {
    return { center: undefined, zoom: 1 };
  }

  const points = focusStations.map((item) => [item.lng, item.lat]);
  const bounds = getBounds(points);
  const center = [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ];

  const lngSpan = Math.max(bounds.maxLng - bounds.minLng + 0.03, 0.04);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat + 0.02, 0.03);
  const globalLngSpan = Math.max(fullMapBounds.maxLng - fullMapBounds.minLng, 0.01);
  const globalLatSpan = Math.max(fullMapBounds.maxLat - fullMapBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(7, Math.max(1.2, Number((0.8 / ratio).toFixed(2))));

  return { center, zoom };
}

function getBlinkOpacity(tone) {
  if (!activeTone.value) return 1;
  if (tone !== activeTone.value) return 0.45;
  return blinkPhase.value ? 1 : 0.22;
}

function stopBlink() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
}

function toggleLegend(key) {
  if (!props.interactiveLegend) return;
  if (activeTone.value === key) {
    activeTone.value = "";
    stopBlink();
    blinkPhase.value = true;
    renderChart();
    return;
  }

  activeTone.value = key;
  blinkPhase.value = true;
  stopBlink();
  blinkTimer = window.setInterval(() => {
    blinkPhase.value = !blinkPhase.value;
    renderChart();
  }, 520);
  renderChart();
}

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }
  echarts.registerMap("laiwu-real-compact", laiwuGeoJson);
  const mapFocus = getMapFocus();
  chart.setOption({
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter(params) {
        if (params.seriesType === "scatter") {
          return `<strong>${params.data.fullName}</strong><br/>负荷状态：${params.data.zoneLabel}<br/>状态说明：${params.data.advice}<br/>充电桩使用率：${params.data.value[2]}%`;
        }
        return `<strong>${params.name}</strong><br/>负荷状态：${params.data?.zoneLabel || "待评估"}<br/>充电桩使用率：${params.value || 0}%`;
      }
    },
    geo: {
      map: "laiwu-real-compact",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "94%",
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      itemStyle: {
        areaColor: "#edf3fa",
        borderColor: "#7f9fcb",
        borderWidth: 1.2
      },
      label: {
        show: true,
        color: "#45607f",
        fontSize: 11
      },
      emphasis: {
        itemStyle: {
          areaColor: "#dce8f8"
        }
      }
    },
    series: [
      {
        type: "map",
        map: "laiwu-real-compact",
        geoIndex: 0,
        center: mapFocus.center,
        zoom: mapFocus.zoom,
        data: districtView.value.map((item) => ({
          name: item.label,
          value: item.utilization,
          zoneLabel: item.zoneLabel,
          advice: item.advice,
          itemStyle: {
            areaColor: areaColors[item.tone],
            opacity: getBlinkOpacity(item.tone)
          }
        }))
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        data: stationView.value.map((item) => ({
          name: item.mapLabel || item.name,
          fullName: item.name,
          zoneLabel: item.zoneLabel,
          advice: item.advice,
          value: [item.lng, item.lat, item.use],
          symbolSize: 15,
          itemStyle: {
            color: toneColors[item.tone],
            borderColor: "#fff",
            borderWidth: 2,
            opacity: getBlinkOpacity(item.tone)
          },
          label: {
            show: props.showStationLabels,
            formatter: item.mapLabel || item.name,
            position: "top",
            distance: 6,
            color: "#355173",
            fontSize: 10,
            fontWeight: 600,
            backgroundColor: activeTone.value && item.tone === activeTone.value ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.86)",
            opacity: getBlinkOpacity(item.tone),
            padding: [2, 4],
            borderRadius: 4
          }
        })),
        labelLayout: {
          hideOverlap: !props.showStationLabels,
          moveOverlap: props.showStationLabels ? "shiftY" : undefined
        },
        label: {
          show: props.showStationLabels
        }
      }
    ]
  });
}

function handleResize() {
  if (chart) chart.resize();
}

onMounted(() => {
  renderChart();
  window.addEventListener("resize", handleResize);
});

watch([districtView, stationView], renderChart, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  stopBlink();
  if (chart) chart.dispose();
});
</script>

<template>
  <CollapsiblePanel
    class="map-snapshot-card"
    :title="title"
    :desc="desc"
    :collapsible="collapsible"
    :default-open="defaultOpen"
  >
    <template #actions>
      <div class="tag">{{ focusSummary }}</div>
    </template>
    <div class="map-snapshot-legend">
      <template v-if="interactiveLegend">
        <button
          v-for="item in legend"
          :key="item.key"
          type="button"
          class="tag interactive"
          :class="[item.key, { active: activeTone === item.key }]"
          @click="toggleLegend(item.key)"
        >
          {{ item.label }}
        </button>
      </template>
      <template v-else>
        <span v-for="item in legend" :key="item.key" class="tag" :class="item.key">{{ item.label }}</span>
      </template>
    </div>
    <div class="map-snapshot-layout">
      <div ref="chartRef" class="mini-map-chart"></div>
      <div class="map-snapshot-side">
        <div class="zone-stat-grid">
          <div v-for="item in zoneStats" :key="item.key" class="zone-stat-card" :class="item.key">
            <div class="label">{{ item.label }}</div>
            <strong>{{ item.count }} 座</strong>
            <div class="muted">{{ item.desc }}</div>
          </div>
        </div>
        <template v-if="sideMode === 'table'">
          <div class="map-side-table">
            <div class="sub-section-title">区域状态</div>
            <div class="table-row header compact-table-row five-cols">
              <span>区域</span>
              <span>状态</span>
              <span>利用率</span>
              <span>建议</span>
              <span>电量</span>
            </div>
            <div v-for="item in districtSummary" :key="item.id" class="table-row compact-table-row five-cols">
              <strong>{{ item.label }}</strong>
              <span class="tag" :class="item.tone">{{ item.zoneLabel }}</span>
              <span>{{ item.utilization }}%</span>
              <span>{{ item.advice }}</span>
              <span>{{ item.energy }} MWh</span>
            </div>
          </div>
          <div class="map-side-table">
            <div class="sub-section-title">重点站点</div>
            <div class="table-row header compact-table-row five-cols station-cols">
              <span>站点</span>
              <span>区域</span>
              <span>状态</span>
              <span>利用率</span>
              <span>负荷</span>
            </div>
            <div v-for="item in focusStations" :key="item.id" class="table-row compact-table-row five-cols station-cols">
              <strong>{{ item.name }}</strong>
              <span>{{ item.district }}</span>
              <span class="tag" :class="item.tone">{{ item.zoneLabel }}</span>
              <span>{{ item.use }}%</span>
              <span>{{ item.load }} MW</span>
            </div>
          </div>
        </template>
        <template v-else-if="sideMode === 'forecast'">
          <div class="list compact-list">
            <div class="sub-section-title">区域预测摘要</div>
            <div v-for="item in forecastDistricts" :key="item.id" class="info-card compact-info-card">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.label }}</div>
                  <strong>{{ item.zoneLabel }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.energy }} MWh</span>
              </div>
              <p class="muted">{{ item.hint }}</p>
            </div>
          </div>
          <div class="list compact-list">
            <div class="sub-section-title">重点站点预测</div>
            <div v-for="item in forecastStations" :key="item.id" class="info-card compact-info-card station-side-card" :class="item.tone">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.district }}</div>
                  <strong>{{ item.name }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.use }}%</span>
              </div>
              <p class="muted">{{ item.hint }}</p>
            </div>
          </div>
        </template>
        <template v-else-if="sideMode === 'decision'">
          <div class="list compact-list">
            <div class="sub-section-title">区域处置摘要</div>
            <div v-for="item in decisionDistricts" :key="item.id" class="info-card compact-info-card">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.label }}</div>
                  <strong>{{ item.zoneLabel }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.utilization }}%</span>
              </div>
              <p class="muted">{{ item.hint }}</p>
            </div>
          </div>
          <div class="list compact-list">
            <div class="sub-section-title">重点执行站点</div>
            <div v-for="item in decisionStations" :key="item.id" class="info-card compact-info-card station-side-card" :class="item.tone">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.district }}</div>
                  <strong>{{ item.name }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.zoneLabel }}</span>
              </div>
              <p class="muted">{{ item.hint }}</p>
            </div>
          </div>
        </template>
        <template v-else-if="sideMode === 'stations'">
          <div class="map-side-table">
            <div class="sub-section-title">站点使用情况</div>
            <div class="table-row header compact-table-row five-cols station-cols">
              <span>站点</span>
              <span>区域</span>
              <span>状态</span>
              <span>利用率</span>
              <span>负荷</span>
            </div>
            <div v-for="item in stationDetails" :key="item.id" class="table-row compact-table-row five-cols station-cols">
              <strong>{{ item.name }}</strong>
              <span>{{ item.district }}</span>
              <span class="tag" :class="item.tone">{{ item.zoneLabel }}</span>
              <span>{{ item.use }}%</span>
              <span>{{ item.load }} MW</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="list compact-list">
            <div class="sub-section-title">区域状态</div>
            <div v-for="item in districtSummary" :key="item.id" class="info-card compact-info-card">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.label }}</div>
                  <strong>{{ item.zoneLabel }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.utilization }}%</span>
              </div>
              <p class="muted">{{ item.advice }}</p>
            </div>
          </div>
          <div class="list compact-list">
            <div class="sub-section-title">重点站点</div>
            <div v-for="item in focusStations" :key="item.id" class="info-card compact-info-card station-side-card" :class="item.tone">
              <div class="station-side-head">
                <div>
                  <div class="label">{{ item.district }}</div>
                  <strong>{{ item.name }}</strong>
                </div>
                <span class="tag" :class="item.tone">{{ item.use }}%</span>
              </div>
              <p class="muted">{{ item.zoneLabel }} · {{ item.advice }}</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </CollapsiblePanel>
</template>
