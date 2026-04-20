<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuGeoJson from "../assets/maps/laiwu-city-map.json";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";
import { getStatusTone } from "../data/dashboard";

const props = defineProps({
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

const legend = [
  { key: "safe", label: "绿色低负荷" },
  { key: "warning", label: "黄色中负荷" },
  { key: "danger", label: "红色高负荷" }
];

const mapRef = ref(null);
const selectedStationId = ref("");
const activeTone = ref("");
const blinkPhase = ref(true);
const manualStationFocus = ref(false);
const mapMode = ref("district");
let blinkTimer;
let chart;
const cityFeatures = laiwuGeoJson.features || [];
const townshipFeatures = laiwuTownshipGeoJson.features || [];

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

const stationView = computed(() =>
  props.stations.map((item) => ({
    ...item,
    tone: getStatusTone(item.use),
    statusLabel: loadStatus[getStatusTone(item.use)].label,
    statusAdvice: loadStatus[getStatusTone(item.use)].desc
  }))
);

const districtView = computed(() =>
  props.districts.map((item) => ({
    ...item,
    tone: getStatusTone(item.utilization),
    statusLabel: loadStatus[getStatusTone(item.utilization)].label,
    statusAdvice: loadStatus[getStatusTone(item.utilization)].desc
  }))
);

watch(
  stationView,
  (items) => {
    if (!items.length) {
      selectedStationId.value = "";
      manualStationFocus.value = false;
      return;
    }
    const exists = items.some((item) => item.id === selectedStationId.value);
    if (!exists) {
      selectedStationId.value = [...items].sort((a, b) => b.use - a.use)[0].id;
      manualStationFocus.value = false;
    }
  },
  { immediate: true }
);

const selectedStation = computed(
  () => stationView.value.find((item) => item.id === selectedStationId.value) || stationView.value[0]
);

const stationSummary = computed(() => ({
  totalFast: stationView.value.reduce((sum, item) => sum + (item.fast || 0), 0),
  totalSlow: stationView.value.reduce((sum, item) => sum + (item.slow || 0), 0),
  activeStations: stationView.value.filter((item) => item.operationStatus === "已投运").length
}));

const activeMapConfig = computed(() =>
  mapMode.value === "township"
    ? {
        name: "laiwu-township-station-base",
        geoJson: laiwuTownshipGeoJson,
        features: townshipFeatures,
        layoutSize: "96%",
        labelFontSize: 10,
        borderWidth: 1,
        areaColor: "#f7fafe",
        borderColor: "#86a5cf"
      }
    : {
        name: "laiwu-real",
        geoJson: laiwuGeoJson,
        features: cityFeatures,
        layoutSize: "95%",
        labelFontSize: 13,
        borderWidth: 1.6,
        areaColor: "#edf3fa",
        borderColor: "#7f9fcb"
      }
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

const cityMapBounds = (() => {
  const points = cityFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

const townshipMapBounds = (() => {
  const points = townshipFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

function getMapFocus() {
  if (manualStationFocus.value && selectedStation.value) {
    return {
      center: [selectedStation.value.lng, selectedStation.value.lat],
      zoom: 7
    };
  }

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
  const baseBounds = mapMode.value === "township" ? townshipMapBounds : cityMapBounds;
  const globalLngSpan = Math.max(baseBounds.maxLng - baseBounds.minLng, 0.01);
  const globalLatSpan = Math.max(baseBounds.maxLat - baseBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(7, Math.max(1.25, Number((0.82 / ratio).toFixed(2))));

  return { center, zoom };
}

function getBlinkOpacity(tone) {
  if (!activeTone.value) return 1;
  if (tone !== activeTone.value) return 0.42;
  return blinkPhase.value ? 1 : 0.2;
}

function stopBlink() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
}

function toggleLegend(key) {
  if (activeTone.value === key) {
    activeTone.value = "";
    manualStationFocus.value = false;
    stopBlink();
    blinkPhase.value = true;
    renderMap();
    return;
  }

  activeTone.value = key;
  manualStationFocus.value = false;
  blinkPhase.value = true;
  stopBlink();
  blinkTimer = window.setInterval(() => {
    blinkPhase.value = !blinkPhase.value;
    renderMap();
  }, 520);
  renderMap();
}

function buildDistrictSeriesData() {
  if (mapMode.value === "township") {
    return townshipFeatures.map((feature) => ({
      name: feature.properties?.name,
      value: 0,
      itemStyle: {
        areaColor: "#f7fafe",
        borderColor: "#86a5cf",
        borderWidth: 1
      }
    }));
  }

  return districtView.value.map((item) => ({
    name: item.label,
    value: item.utilization,
    energy: item.energy,
    note: item.note,
    statusLabel: item.statusLabel,
    statusAdvice: item.statusAdvice,
    itemStyle: {
      areaColor: areaColors[item.tone],
      opacity: getBlinkOpacity(item.tone)
    }
  }));
}

function buildStationScatterData() {
  return stationView.value.map((item) => ({
    id: item.id,
    name: item.mapLabel || item.name,
    fullName: item.name,
    value: [item.lng, item.lat, item.use],
    load: item.load,
    tone: item.tone,
    statusLabel: item.statusLabel,
    statusAdvice: item.statusAdvice,
    symbolSize: manualStationFocus.value && selectedStation.value?.id === item.id
      ? 18
      : selectedStation.value && selectedStation.value.id === item.id
        ? 18
        : 13,
    itemStyle: {
      color: toneColors[item.tone],
      borderColor: "#ffffff",
      borderWidth: 2,
      opacity: getBlinkOpacity(item.tone),
      shadowBlur: manualStationFocus.value && selectedStation.value?.id === item.id ? 18 : 0,
      shadowColor: manualStationFocus.value && selectedStation.value?.id === item.id ? `${toneColors[item.tone]}66` : "transparent"
    },
    label: {
      show: true,
      formatter: item.mapLabel || item.name,
      position: "right",
      color: "#355173",
      fontSize: 11,
      opacity: getBlinkOpacity(item.tone)
    }
  }));
}

function renderMap() {
  if (!mapRef.value) return;
  if (!chart) {
    chart = echarts.init(mapRef.value);
    chart.on("click", (params) => {
      if (params.seriesType === "scatter" && params.data?.id) {
        selectedStationId.value = params.data.id;
        manualStationFocus.value = true;
      }
    });
  }

  const mapConfig = activeMapConfig.value;
  echarts.registerMap(mapConfig.name, mapConfig.geoJson);
  const mapFocus = getMapFocus();
  const selectedIndex = stationView.value.findIndex((item) => item.id === selectedStation.value?.id);

  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 260,
    tooltip: {
      show: false
    },
    geo: {
      map: mapConfig.name,
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: mapConfig.layoutSize,
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      itemStyle: {
        areaColor: mapConfig.areaColor,
        borderColor: mapConfig.borderColor,
        borderWidth: mapConfig.borderWidth
      },
      emphasis: {
        itemStyle: {
          areaColor: "#dce8f8"
        },
        label: {
          color: "#1f4f99"
        }
      },
      label: {
        show: true,
        color: "#355173",
        fontSize: mapConfig.labelFontSize,
        fontWeight: 600
      }
    },
    series: [
      {
        type: "map",
        map: mapConfig.name,
        geoIndex: 0,
        center: mapFocus.center,
        zoom: mapFocus.zoom,
        data: buildDistrictSeriesData(),
        selectedMode: false,
        label: {
          show: true,
          color: "#355173",
          fontSize: mapConfig.labelFontSize,
          fontWeight: 600
        }
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        data: buildStationScatterData(),
        zlevel: 3
      },
      {
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 4,
        silent: true,
        tooltip: { show: false },
        rippleEffect: {
          scale: 4.2,
          brushType: "stroke"
        },
        itemStyle: {
          color: selectedStation.value ? toneColors[selectedStation.value.tone] : "#2f66c5",
          shadowBlur: 0
        },
        symbolSize: 20,
        data:
          manualStationFocus.value && selectedStation.value
            ? [{
                value: [selectedStation.value.lng, selectedStation.value.lat, selectedStation.value.use]
              }]
            : []
      }
    ]
  });

  chart.dispatchAction({ type: "hideTip" });
  chart.dispatchAction({ type: "downplay", seriesIndex: 1 });
  if (manualStationFocus.value && selectedIndex >= 0) {
    requestAnimationFrame(() => {
      if (!chart) return;
      chart.dispatchAction({ type: "highlight", seriesIndex: 1, dataIndex: selectedIndex });
    });
  }
}

function handleResize() {
  if (chart) chart.resize();
}

onMounted(() => {
  renderMap();
  window.addEventListener("resize", handleResize);
});

watch([districtView, stationView, selectedStation, mapMode], renderMap, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  stopBlink();
  if (chart) chart.dispose();
});
</script>

<template>
  <CollapsiblePanel
    :collapsible="collapsible"
    :default-open="defaultOpen"
  >
    <template #header>
      <div>
        <h3 class="panel-title">充电站一览图</h3>
        <div class="panel-desc">按充电站充电桩使用率展示绿色低负荷、黄色中负荷、红色高负荷，重点体现各站点当前负荷状态。</div>
        <div class="map-header-actions">
          <div class="tabs map-mode-toggle">
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mapMode === 'district' }"
              @click="mapMode = 'district'"
            >
              区县底图
            </button>
            <button
              type="button"
              class="tab-btn"
              :class="{ active: mapMode === 'township' }"
              @click="mapMode = 'township'"
            >
              街道乡镇底图
            </button>
          </div>
          <div class="legend map-panel-legend">
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
          </div>
        </div>
      </div>
    </template>

    <div class="map-station-grid map-station-grid-compact">
      <button
        v-for="station in stationView"
        :key="station.id"
        type="button"
        class="station-card"
        :class="[station.tone, { active: selectedStation && selectedStation.id === station.id }]"
        @click="selectedStationId = station.id; manualStationFocus = true"
      >
        <div class="station-card-head">
          <strong>{{ station.name }}</strong>
          <span>{{ station.statusLabel }}</span>
        </div>
        <p>{{ station.sceneType }} / {{ station.district }}</p>
        <div class="station-card-meta">
          <span>快 {{ station.fast }} 慢 {{ station.slow }}</span>
          <span>利用率 {{ station.use }}%</span>
        </div>
      </button>
    </div>

    <div class="map-panel">
      <div class="map-box">
        <div class="map-meta-strip">
          <div class="map-mini-stat">
            <span>落图站点</span>
            <strong>{{ stationView.length }} 座</strong>
          </div>
          <div class="map-mini-stat">
            <span>快充枪</span>
            <strong>{{ stationSummary.totalFast }} 个</strong>
          </div>
          <div class="map-mini-stat">
            <span>慢充枪</span>
            <strong>{{ stationSummary.totalSlow }} 个</strong>
          </div>
          <div class="map-mini-stat">
            <span>已投运</span>
            <strong>{{ stationSummary.activeStations }} 座</strong>
          </div>
        </div>

        <div ref="mapRef" class="real-map-chart"></div>
      </div>

      <div class="map-side">
        <div v-if="selectedStation" class="detail-card">
          <div class="detail-card-head">
            <div>
              <div class="label">重点站点详情</div>
              <strong>{{ selectedStation.name }}</strong>
            </div>
            <span class="tag" :class="selectedStation.tone">{{ selectedStation.statusLabel }}</span>
          </div>
          <div class="station-detail-grid">
            <div class="station-kv">
              <span>负荷说明</span>
              <strong>{{ selectedStation.statusAdvice }}</strong>
            </div>
            <div class="station-kv">
              <span>行政区</span>
              <strong>{{ selectedStation.district }}</strong>
            </div>
            <div class="station-kv">
              <span>站点类型</span>
              <strong>{{ selectedStation.sceneType }}</strong>
            </div>
            <div class="station-kv">
              <span>运营单位</span>
              <strong>{{ selectedStation.operator }}</strong>
            </div>
            <div class="station-kv">
              <span>投运状态</span>
              <strong>{{ selectedStation.operationStatus }}</strong>
            </div>
            <div class="station-kv">
              <span>充电枪配置</span>
              <strong>快充 {{ selectedStation.fast }} / 慢充 {{ selectedStation.slow }}</strong>
            </div>
            <div class="station-kv">
              <span>当前负荷</span>
              <strong>{{ selectedStation.load }} MW / 使用率 {{ selectedStation.use }}%</strong>
            </div>
            <div class="station-kv">
              <span>充电电价</span>
              <strong>{{ selectedStation.chargeFee }}</strong>
            </div>
            <div class="station-kv">
              <span>服务费</span>
              <strong>{{ selectedStation.serviceFee }}</strong>
            </div>
            <div class="station-kv">
              <span>支付方式</span>
              <strong>{{ selectedStation.payment }}</strong>
            </div>
            <div class="station-kv">
              <span>布设形式</span>
              <strong>{{ selectedStation.distribution }}</strong>
            </div>
          </div>
          <div class="detail-address">
            <span>详细地址</span>
            <strong>{{ selectedStation.address }}</strong>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>
