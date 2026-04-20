<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";

const props = defineProps({
  title: {
    type: String,
    default: "莱芜乡镇/街道充电站数量分区图"
  },
  desc: {
    type: String,
    default: "按乡镇/街道统计现有充电站数量，并以红黄绿三色反映布点覆盖差异。"
  },
  stations: {
    type: Array,
    required: true
  },
  townships: {
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
let chart;
let blinkTimer;
const townshipFeatures = laiwuTownshipGeoJson.features || [];

const quantityToneConfig = {
  high: {
    label: "红色站点集中区",
    marker: "红色",
    desc: "站点数量较多，可重点关注容量与利用率",
    color: "#df5b57",
    area: "#f3a7a4",
    labelBg: "#fff3f2",
    labelText: "#c43d39"
  },
  medium: {
    label: "黄色一般覆盖区",
    marker: "黄色",
    desc: "已有站点覆盖，需继续观察需求增长",
    color: "#e5a623",
    area: "#f6d67b",
    labelBg: "#fff8e8",
    labelText: "#b67800"
  },
  low: {
    label: "绿色低覆盖区",
    marker: "绿色",
    desc: "站点较少或暂未覆盖，可作为布点关注区域",
    color: "#59b97c",
    area: "#cfeeda",
    labelBg: "#effaf2",
    labelText: "#2c8b4e"
  }
};

function getQuantityTone(stationCount) {
  if (stationCount >= 2) return "high";
  if (stationCount >= 1) return "medium";
  return "low";
}

const townshipSummary = computed(() =>
  props.townships
    .map((item) => {
      const relatedStations = props.stations.filter((station) => station.townshipKey === item.key);
      const stationCount = relatedStations.length;
      const pileCount = relatedStations.reduce((sum, station) => sum + (station.fast || 0) + (station.slow || 0), 0);
      const tone = getQuantityTone(stationCount);
      return {
        key: item.key,
        name: item.name,
        district: item.district,
        stationCount,
        pileCount,
        tone,
        toneLabel: quantityToneConfig[tone].label,
        toneDesc: quantityToneConfig[tone].desc
      };
    })
    .sort((a, b) => b.stationCount - a.stationCount || b.pileCount - a.pileCount)
);

const quantityStats = computed(() => [
  {
    key: "high",
    label: quantityToneConfig.high.label,
    count: townshipSummary.value.filter((item) => item.tone === "high").length,
    desc: quantityToneConfig.high.desc
  },
  {
    key: "medium",
    label: quantityToneConfig.medium.label,
    count: townshipSummary.value.filter((item) => item.tone === "medium").length,
    desc: quantityToneConfig.medium.desc
  },
  {
    key: "low",
    label: quantityToneConfig.low.label,
    count: townshipSummary.value.filter((item) => item.tone === "low").length,
    desc: quantityToneConfig.low.desc
  }
]);

const topTownships = computed(() => townshipSummary.value.slice(0, 6));
const focusSummary = computed(() => {
  const focus = topTownships.value[0];
  return focus ? `${focus.name} · ${focus.stationCount}座站` : "暂无乡镇站点信息";
});
const legendInfoList = computed(() => [
  { key: "high", label: quantityToneConfig.high.marker, desc: quantityToneConfig.high.desc },
  { key: "medium", label: quantityToneConfig.medium.marker, desc: quantityToneConfig.medium.desc },
  { key: "low", label: quantityToneConfig.low.marker, desc: quantityToneConfig.low.desc }
]);

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
  const points = townshipFeatures.flatMap((feature) => extractGeometryPoints(feature.geometry));
  return getBounds(points);
})();

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

function getMapFocus() {
  if (!activeTone.value) {
    return { center: undefined, zoom: 1 };
  }

  const focusTownships = townshipSummary.value.filter((item) => item.tone === activeTone.value);
  if (!focusTownships.length) {
    return { center: undefined, zoom: 1 };
  }

  const points = townshipFeatures
    .filter((feature) => focusTownships.some((item) => item.name === feature.properties?.name))
    .flatMap((feature) => extractGeometryPoints(feature.geometry));

  if (!points.length) {
    return { center: undefined, zoom: 1 };
  }

  const bounds = getBounds(points);
  const center = [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ];

  const lngSpan = Math.max(bounds.maxLng - bounds.minLng + 0.03, 0.04);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat + 0.03, 0.04);
  const globalLngSpan = Math.max(fullMapBounds.maxLng - fullMapBounds.minLng, 0.01);
  const globalLatSpan = Math.max(fullMapBounds.maxLat - fullMapBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(7, Math.max(1.2, Number((0.82 / ratio).toFixed(2))));

  return { center, zoom };
}

function renderChart() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
  }

  echarts.registerMap("laiwu-township-quantity", laiwuTownshipGeoJson);
  const mapFocus = getMapFocus();
  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 320,
    tooltip: {
      trigger: "item",
      formatter(params) {
        return [
          `<strong>${params.data?.name || params.name}</strong>`,
          `所属区域：${params.data?.district || "-"}`,
          `站点数量：${params.data?.stationCount || 0} 座`,
          `充电桩数量：${params.data?.pileCount || 0} 个`,
          `分区状态：${params.data?.toneLabel || "-"}`
        ].join("<br/>");
      }
    },
    series: [
      {
        type: "map",
        map: "laiwu-township-quantity",
        roam: false,
        layoutCenter: ["50%", "50%"],
        layoutSize: "95%",
        center: mapFocus.center,
        zoom: mapFocus.zoom,
        data: townshipSummary.value.map((item) => ({
          name: item.name,
          district: item.district,
          stationCount: item.stationCount,
          pileCount: item.pileCount,
          toneLabel: item.toneLabel,
          value: item.stationCount,
          itemStyle: {
            areaColor: quantityToneConfig[item.tone].area,
            borderColor: quantityToneConfig[item.tone].color,
            borderWidth: item.stationCount > 0 ? 2 : 1.4,
            opacity: getBlinkOpacity(item.tone)
          },
          label: {
            show: true,
            color: quantityToneConfig[item.tone].labelText,
            fontSize: 10,
            fontWeight: 500,
            backgroundColor: quantityToneConfig[item.tone].labelBg,
            borderColor: `${quantityToneConfig[item.tone].color}88`,
            borderWidth: 1,
            borderRadius: 4,
            padding: [2, 4]
          },
          emphasis: {
            itemStyle: {
              areaColor: quantityToneConfig[item.tone].area,
              borderColor: quantityToneConfig[item.tone].color,
              borderWidth: 2,
              opacity: 1
            },
            label: {
              color: quantityToneConfig[item.tone].labelText,
              fontWeight: 500,
              backgroundColor: quantityToneConfig[item.tone].labelBg
            }
          }
        })),
        itemStyle: {
          areaColor: "#dfeaf8",
          borderColor: "#7f9fcb",
          borderWidth: 1.2
        },
        emphasis: {
          itemStyle: {
            borderColor: "#2f66c5",
            borderWidth: 1.8
          },
          label: {
            fontWeight: 500
          }
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

watch(() => [props.stations, props.townships], renderChart, { deep: true });

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
      <button
        type="button"
        class="tag interactive quantity-high"
        :class="{ active: activeTone === 'high' }"
        @click="toggleLegend('high')"
      >
        {{ quantityToneConfig.high.label }}
      </button>
      <button
        type="button"
        class="tag interactive quantity-medium"
        :class="{ active: activeTone === 'medium' }"
        @click="toggleLegend('medium')"
      >
        {{ quantityToneConfig.medium.label }}
      </button>
      <button
        type="button"
        class="tag interactive quantity-low"
        :class="{ active: activeTone === 'low' }"
        @click="toggleLegend('low')"
      >
        {{ quantityToneConfig.low.label }}
      </button>
      <div class="map-snapshot-legend-desc">
        <span v-for="item in legendInfoList" :key="item.key" class="map-snapshot-legend-item">
          <strong>{{ item.label }}：</strong>{{ item.desc }}
        </span>
      </div>
    </div>
    <div class="map-snapshot-layout">
      <div ref="chartRef" class="mini-map-chart"></div>
      <div class="map-snapshot-side">
        <div class="zone-stat-grid">
          <div v-for="item in quantityStats" :key="item.key" class="zone-stat-card" :class="`quantity-${item.key}`">
            <div class="label">{{ item.label }}</div>
            <strong>{{ item.count }} 个</strong>
          </div>
        </div>
        <div class="map-side-table">
          <div class="sub-section-title">乡镇/街道站点分区</div>
          <div class="table-row header compact-table-row five-cols township-quantity-cols">
            <span>乡镇/街道</span>
            <span>区域</span>
            <span>分区</span>
            <span>站点</span>
            <span>充电桩</span>
          </div>
          <div v-for="item in topTownships" :key="item.key" class="table-row compact-table-row five-cols township-quantity-cols">
            <strong>{{ item.name }}</strong>
            <span>{{ item.district }}</span>
            <span class="tag" :class="`quantity-${item.tone}`">{{ item.toneLabel }}</span>
            <span>{{ item.stationCount }} 座</span>
            <span>{{ item.pileCount }} 个</span>
          </div>
        </div>
      </div>
    </div>
  </CollapsiblePanel>
</template>
