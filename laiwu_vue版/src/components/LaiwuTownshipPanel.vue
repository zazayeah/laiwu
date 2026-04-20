<script setup>
import * as echarts from "echarts";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import laiwuTownshipGeoJson from "../assets/maps/laiwu-townships-map.json";
import CollapsiblePanel from "./CollapsiblePanel.vue";
import { getStatusTone } from "../data/dashboard";

const props = defineProps({
  title: {
    type: String,
    default: "街道/乡镇细化地图"
  },
  desc: {
    type: String,
    default: "基于街道/乡镇粒度查看站点数量、充电量增长和当前充电桩承载状态。"
  },
  labels: {
    type: Array,
    required: true
  },
  stations: {
    type: Array,
    required: true
  },
  townships: {
    type: Array,
    required: true
  },
  selectedKey: {
    type: String,
    default: ""
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

const emit = defineEmits(["select"]);

const chartRef = ref(null);
let chart;

const townshipFeatures = laiwuTownshipGeoJson.features || [];

const toneColors = {
  safe: "#44b879",
  warning: "#e5a623",
  danger: "#df5b57",
  uncovered: "#67be85"
};

const toneAreaColors = {
  safe: "#c9ead7",
  warning: "#f7dc94",
  danger: "#f4b3af",
  uncovered: "#daf1e2"
};

const toneLabelColors = {
  safe: "#1f8a51",
  warning: "#a66f00",
  danger: "#bd3d38",
  uncovered: "#358e57"
};

const townshipLoadStatus = {
  safe: {
    label: "绿色低承载",
    desc: "当前充电桩承载压力较低"
  },
  warning: {
    label: "黄色中承载",
    desc: "当前充电桩承载压力中等"
  },
  danger: {
    label: "红色高承载",
    desc: "当前充电桩承载压力较高"
  },
  uncovered: {
    label: "绿色未覆盖",
    desc: "当前无充电桩，暂无法形成承载状态"
  }
};

const townshipView = computed(() =>
  props.townships.map((item) => ({
    ...item,
    latestEnergy: item.energySeries[item.energySeries.length - 1]
  }))
);

const stationView = computed(() =>
  props.stations.map((item) => ({
    ...item,
    pileCount: (item.fast || 0) + (item.slow || 0),
    tone: getStatusTone(item.use),
    zoneLabel: townshipLoadStatus[getStatusTone(item.use)].label
  }))
);

const townshipWithPiles = computed(() =>
  townshipView.value.map((item) => {
    const relatedStations = stationView.value.filter((station) => station.townshipKey === item.key);
    const pileCount = relatedStations.reduce((sum, station) => sum + station.pileCount, 0);
    const tone = pileCount > 0 ? getStatusTone(item.utilization) : "uncovered";
    return {
      ...item,
      realStationCount: relatedStations.length,
      pileCount,
      tone,
      zoneLabel: townshipLoadStatus[tone].label,
      advice: townshipLoadStatus[tone].desc
    };
  })
);

const selectedTownship = computed(
  () => townshipWithPiles.value.find((item) => item.key === props.selectedKey) || townshipWithPiles.value[0]
);

function extractGeometryPoints(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") {
    return geometry.coordinates.flat();
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat(2);
  }
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

function getTownshipFocus(name) {
  const feature = townshipFeatures.find((item) => item.properties?.name === name);
  if (!feature) {
    return { center: undefined, zoom: 1 };
  }

  const points = extractGeometryPoints(feature.geometry);
  if (!points.length) {
    return { center: undefined, zoom: 1 };
  }

  const bounds = getBounds(points);
  const center = [
    Number(((bounds.minLng + bounds.maxLng) / 2).toFixed(6)),
    Number(((bounds.minLat + bounds.maxLat) / 2).toFixed(6))
  ];

  const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.01);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.01);
  const globalLngSpan = Math.max(fullMapBounds.maxLng - fullMapBounds.minLng, 0.01);
  const globalLatSpan = Math.max(fullMapBounds.maxLat - fullMapBounds.minLat, 0.01);
  const ratio = Math.max(lngSpan / globalLngSpan, latSpan / globalLatSpan);
  const zoom = Math.min(6, Math.max(1.8, Number((0.62 / ratio).toFixed(2))));

  return { center, zoom };
}

function renderMap() {
  if (!chartRef.value) return;
  if (!chart) {
    chart = echarts.init(chartRef.value);
    chart.on("click", (params) => {
      if (params.data?.key) {
        emit("select", params.data.key);
      }
    });
  }

  echarts.registerMap("laiwu-township", laiwuTownshipGeoJson);
  const mapFocus = getTownshipFocus(selectedTownship.value?.name);

  chart.setOption({
    backgroundColor: "transparent",
    animationDurationUpdate: 320,
    tooltip: {
      trigger: "item",
      formatter(params) {
        if (params.seriesType === "scatter") {
          return [
            `<strong>${params.data.fullName}</strong>`,
            `所在乡镇：${townshipWithPiles.value.find((item) => item.key === params.data.townshipKey)?.name || "-"}`,
            `当前负荷状态：${params.data.zoneLabel}`,
            `现有充电桩：${params.data.pileCount} 个`,
            `快充：${params.data.fast} / 慢充：${params.data.slow}`
          ].join("<br/>");
        }
        return [
          `<strong>${params.name}</strong>`,
          `所属区域：${params.data?.district || "-"}`,
          `充电站数量：${params.data?.realStationCount || 0} 座`,
          `充电桩数量：${params.data?.pileCount || 0} 个`,
          `当前状态：${params.data?.zoneLabel || "-"}`
        ].join("<br/>");
      }
    },
    geo: {
      map: "laiwu-township",
      roam: false,
      layoutCenter: ["50%", "50%"],
      layoutSize: "96%",
      center: mapFocus.center,
      zoom: mapFocus.zoom,
      itemStyle: {
        areaColor: "transparent",
        borderColor: "transparent",
        borderWidth: 0
      },
      label: {
        show: false
      }
    },
    series: [
      {
        type: "map",
        map: "laiwu-township",
        roam: false,
        layoutCenter: ["50%", "50%"],
        layoutSize: "96%",
        center: mapFocus.center,
        zoom: mapFocus.zoom,
        zlevel: 1,
        data: townshipWithPiles.value.map((item) => ({
          key: item.key,
          name: item.name,
          district: item.district,
          zoneLabel: item.zoneLabel,
          advice: item.advice,
          realStationCount: item.realStationCount,
          pileCount: item.pileCount,
          latestEnergy: item.latestEnergy,
          value: item.pileCount > 0 ? item.utilization : 0,
          itemStyle: {
            areaColor: toneAreaColors[item.tone],
            borderColor: selectedTownship.value?.key === item.key ? toneColors[item.tone] : "#7f9fcb",
            borderWidth: selectedTownship.value?.key === item.key ? 4.2 : 1,
            opacity: selectedTownship.value?.key === item.key ? 1 : 0.55,
            shadowBlur: selectedTownship.value?.key === item.key ? 22 : 0,
            shadowColor: selectedTownship.value?.key === item.key ? `${toneColors[item.tone]}66` : "transparent",
            shadowOffsetX: 0,
            shadowOffsetY: 0
          },
          label: {
            show: true,
            color: toneLabelColors[item.tone],
            fontSize: selectedTownship.value?.key === item.key ? 11 : 10,
            fontWeight: selectedTownship.value?.key === item.key ? 700 : 500,
            backgroundColor: selectedTownship.value?.key === item.key ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.66)",
            padding: selectedTownship.value?.key === item.key ? [3, 6] : [2, 4],
            borderRadius: 4
          },
          emphasis: {
            itemStyle: {
              areaColor: toneAreaColors[item.tone],
              borderColor: toneColors[item.tone],
              borderWidth: selectedTownship.value?.key === item.key ? 4.4 : 2.2,
              opacity: 1,
              shadowBlur: selectedTownship.value?.key === item.key ? 24 : 8,
              shadowColor: `${toneColors[item.tone]}66`
            },
            label: {
              color: toneLabelColors[item.tone],
              fontWeight: selectedTownship.value?.key === item.key ? 700 : 500,
              backgroundColor: selectedTownship.value?.key === item.key ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.8)"
            }
          }
        })),
        selectedMode: false,
        emphasis: {
          itemStyle: {
            borderColor: "#2f66c5",
            borderWidth: 2
          },
          label: {
            fontWeight: 500
          }
        }
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        zlevel: 4,
        data: stationView.value.map((item) => ({
          name: item.mapLabel || item.name,
          fullName: item.name,
          townshipKey: item.townshipKey,
          pileCount: item.pileCount,
          fast: item.fast,
          slow: item.slow,
          zoneLabel: item.zoneLabel,
          value: [item.lng, item.lat, item.use],
          symbolSize: Math.max(12, Math.min(20, 10 + item.pileCount / 2)),
          itemStyle: {
            color: toneColors[item.tone],
            borderColor: "#ffffff",
            borderWidth: 2
          },
          label: {
            show: true,
            formatter: `${item.mapLabel || item.name}\n${item.pileCount}桩`,
            position: "top",
            distance: 6,
            color: "#355173",
            fontSize: 10,
            fontWeight: 600,
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: [2, 4],
            borderRadius: 4
          }
        })),
        tooltip: {
          formatter(params) {
            return [
              `<strong>${params.data.fullName}</strong>`,
              `所在乡镇：${townshipWithPiles.value.find((item) => item.key === params.data.townshipKey)?.name || "-"}`,
              `充电桩数量：${params.data.pileCount} 个`,
              `快充：${params.data.fast} / 慢充：${params.data.slow}`,
              `当前状态：${params.data.zoneLabel}`
            ].join("<br/>");
          }
        },
        labelLayout: {
          hideOverlap: true,
          moveOverlap: "shiftY"
        }
      }
    ]
  });
}

function handleResize() {
  if (chart) chart.resize();
}

onMounted(() => {
  renderMap();
  window.addEventListener("resize", handleResize);
});

watch(() => [props.selectedKey, props.townships], renderMap, { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (chart) chart.dispose();
});
</script>

<template>
  <CollapsiblePanel
    :title="title"
    :desc="desc"
    :collapsible="collapsible"
    :default-open="defaultOpen"
  >
    <template #actions>
      <slot name="actions">
        <div class="tag">{{ selectedTownship?.name }} · {{ selectedTownship?.zoneLabel }}</div>
      </slot>
    </template>
    <div class="township-map-shell">
      <div ref="chartRef" class="township-map-chart"></div>
      <div class="township-side">
        <div class="info-card">
          <div class="label">当前乡镇</div>
          <strong>{{ selectedTownship?.name }}</strong>
          <p class="muted">{{ selectedTownship?.district }} · {{ selectedTownship?.advice }}</p>
        </div>
        <div class="table-row header compact-table-row township-side-row">
          <span>指标</span>
          <span>当前值</span>
        </div>
        <div class="table-row compact-table-row township-side-row">
          <strong>现有充电站</strong>
          <span>{{ selectedTownship?.realStationCount }} 座</span>
        </div>
        <div class="table-row compact-table-row township-side-row">
          <strong>现有充电桩</strong>
          <span>{{ selectedTownship?.pileCount }} 个</span>
        </div>
        <div class="table-row compact-table-row township-side-row">
          <strong>年度充电量</strong>
          <span>{{ selectedTownship?.latestEnergy }} MWh</span>
        </div>
        <div class="table-row compact-table-row township-side-row">
          <strong>承载状态</strong>
          <span>{{ selectedTownship?.pileCount > 0 ? `${selectedTownship?.utilization}%` : selectedTownship?.zoneLabel }}</span>
        </div>
        <div class="status-note">{{ selectedTownship?.recommendation }}。{{ selectedTownship?.reason }}</div>
      </div>
    </div>
  </CollapsiblePanel>
</template>
