import { buildStationUserProfiles, getScenario } from "../data/dashboard";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function average(list, start, end) {
  const values = list.slice(start, end);
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function findStation(scenario, focusStation) {
  return (
    scenario.stations.find((item) => item.id === focusStation || item.name === focusStation) ||
    scenario.stations[0]
  );
}

function loadProfileFallback(payload) {
  const scenario = payload.scenario || getScenario(payload.scenarioKey);
  const station = findStation(scenario, payload.focusStation);
  const ratio = station.load / 3.8;
  const profileBump = station.cluster === "峰段敏感型" ? 1.12 : station.cluster === "午间消纳型" ? 1.08 : 1.02;
  const load = scenario.loadSeries.actual.map((value, index) => {
    let factor = ratio;
    if (index >= 11 && index < 14 && station.cluster === "午间消纳型") factor += 0.35;
    if (index >= 18 && index < 22 && station.cluster === "峰段敏感型") factor += 0.4;
    if ((index < 6 || index >= 22) && station.cluster === "谷段承接型") factor += 0.28;
    return Number((value * factor * 0.26 * profileBump).toFixed(2));
  });
  const baseline = scenario.loadSeries.forecast.map((value, index) => {
    let factor = ratio;
    if (index >= 18 && index < 22) factor += station.use >= 85 ? 0.2 : 0.08;
    return Number((value * factor * 0.25).toFixed(2));
  });
  const max = Math.max(...load);
  const min = Math.min(...load);
  return {
    status: "LOCAL",
    module: "loadProfile",
    scenarioKey: payload.scenarioKey,
    generatedAt: new Date().toISOString(),
    summary: {
      focusStation: station.name,
      typicalCluster: station.cluster,
      volatilityIndex: Number((((max - min) / max) * 100).toFixed(1)),
      impactIndex: Math.max(12, Math.round((station.use - 55) * 1.2))
    },
    tags: ["时序特征评估", "波动性评估", "冲击性评估", "负荷曲线聚类"],
    trend: {
      labels: scenario.loadSeries.labels,
      load,
      baseline
    }
  };
}

function userProfileFallback(payload) {
  const scenario = payload.scenario || getScenario(payload.scenarioKey);
  const stationIds = payload.stationIds?.length ? payload.stationIds : scenario.stations.map((item) => item.id);
  const stationForecast = stationIds.map((stationId, index) => {
    const station = scenario.stations.find((item) => item.id === stationId) || scenario.stations[index] || scenario.stations[0];
    return {
      stationId,
      stationName: station.name,
      demandMwh: Number((station.load * 2.1 + index * 0.8).toFixed(1)),
      peakWindow: ["10:00-12:00", "18:00-20:00", "12:00-14:00", "19:00-21:00"][index % 4]
    };
  });
  const forecastMap = new Map(stationForecast.map((item) => [item.stationId, item]));
  return {
    status: "LOCAL",
    module: "userProfile",
    scenarioKey: payload.scenarioKey,
    generatedAt: new Date().toISOString(),
    horizonHours: payload.horizonHours ?? 4,
    segments: scenario.segments.map((item) => ({
      name: item.label,
      share: item.share,
      avgEnergy: item.avgEnergy,
      flexibility: item.flexibility
    })),
    stationPortraits: buildStationUserProfiles(scenario, scenario.segments).map((item) => ({
      ...item,
      demandMwh: forecastMap.get(item.stationId)?.demandMwh,
      peakWindow: forecastMap.get(item.stationId)?.peakWindow || item.peakWindow
    })),
    demandPrediction: {
      labels: ["T+1", "T+2", "T+3", "T+4"],
      totalDemand: [
        Number((scenario.metrics[0].value / 12).toFixed(1)),
        Number((scenario.metrics[0].value / 11.5).toFixed(1)),
        Number((scenario.metrics[0].value / 11.2).toFixed(1)),
        Number((scenario.metrics[0].value / 11.4).toFixed(1))
      ],
      baseline: [
        Number((scenario.metrics[0].value / 12.4).toFixed(1)),
        Number((scenario.metrics[0].value / 11.9).toFixed(1)),
        Number((scenario.metrics[0].value / 11.6).toFixed(1)),
        Number((scenario.metrics[0].value / 11.8).toFixed(1))
      ],
      stationForecast
    }
  };
}

function flexibilityFallback(payload) {
  const scenario = payload.scenario || getScenario(payload.scenarioKey);
  const serviceGuard = Number(payload.serviceGuard ?? 90);
  const priceSpread = Number(payload.priceSpread ?? 0.82);
  const baseline = [
    average(scenario.loadSeries.forecast, 0, 4),
    average(scenario.loadSeries.forecast, 4, 8),
    average(scenario.loadSeries.forecast, 8, 12),
    average(scenario.loadSeries.forecast, 12, 16),
    average(scenario.loadSeries.forecast, 16, 20),
    average(scenario.loadSeries.forecast, 20, 24)
  ].map((item) => Number(item.toFixed(1)));
  const shiftableEnergyMwh = Math.max(4.5, 26 - (serviceGuard - 80) * 0.8);
  const reduciblePowerMw = Math.max(0.8, shiftableEnergyMwh / 8 + priceSpread * 1.1);
  const expectedBenefitWan = Number((shiftableEnergyMwh * priceSpread * 0.038).toFixed(2));
  const after = baseline.map((item, index) => {
    if (index === 0 || index === 3) return Number((item + shiftableEnergyMwh * 0.18).toFixed(1));
    if (index === 4 || index === 5) return Number((item - reduciblePowerMw * 0.9).toFixed(1));
    return item;
  });
  return {
    status: "LOCAL",
    module: "flexibility",
    scenarioKey: payload.scenarioKey,
    generatedAt: new Date().toISOString(),
    summary: {
      serviceGuard,
      priceSpread,
      shiftableEnergyMwh: Number(shiftableEnergyMwh.toFixed(1)),
      reduciblePowerMw: Number(reduciblePowerMw.toFixed(1)),
      expectedBenefitWan
    },
    curve: {
      labels: ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"],
      before: baseline,
      after
    },
    recommendations: ["午间增充", "夜谷预约", "峰段降功率"]
  };
}

function forecastFallback(payload) {
  const scenario = payload.scenario || getScenario(payload.scenarioKey);
  const viewKey =
    payload.scope === "station"
      ? "shortStation"
      : payload.scope === "mediumLong"
        ? "mediumLong"
        : "shortRegion";
  const view = scenario.forecastViews[viewKey];
  const spread = Math.max(...view.primary) - Math.min(...view.primary);
  return {
    status: "LOCAL",
    module: "forecast",
    scenarioKey: payload.scenarioKey,
    generatedAt: new Date().toISOString(),
    scope: payload.scope,
    horizon: payload.horizon,
    view,
    accuracy: {
      mape: Number((4.2 + spread * 0.04).toFixed(2)),
      rmse: Number((0.48 + spread * 0.03).toFixed(2))
    }
  };
}

async function request(path, payload, fallbackBuilder) {
  if (!BASE_URL) {
    return fallbackBuilder();
  }
  try {
    const response = await fetch(`${BASE_URL}/integration/algorithm${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    const result = await response.json();
    if (result?.status === "DOWN") {
      return fallbackBuilder();
    }
    return result;
  } catch (error) {
    return fallbackBuilder();
  }
}

export function analyzeLoadProfile(payload) {
  return request("/load-profile/analyze", payload, () => loadProfileFallback(payload));
}

export function predictUserProfile(payload) {
  return request("/user-profile/predict", payload, () => userProfileFallback(payload));
}

export function evaluateFlexibility(payload) {
  return request("/flexibility/evaluate", payload, () => flexibilityFallback(payload));
}

export function predictForecast(payload) {
  return request("/forecast/predict", payload, () => forecastFallback(payload));
}
