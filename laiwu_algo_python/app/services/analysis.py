from __future__ import annotations

from datetime import datetime

from app.schemas import (
    FlexibilityRequest,
    ForecastRequest,
    LoadProfileRequest,
    UserProfileRequest,
)

SCENARIO_FACTORS = {
    "spring": {
        "name": "春秋工作日",
        "volatility": 0.31,
        "impact": 0.42,
        "cluster": "午间消纳型",
        "shiftable_mwh": 28.6,
        "reducible_mw": 2.2,
        "benefit_wan": 0.93,
        "segments": [
            {"name": "区域配送型", "share": 41, "avgEnergy": "86 kWh", "flexibility": "中高"},
            {"name": "跨省长途型", "share": 34, "avgEnergy": "132 kWh", "flexibility": "中"},
            {"name": "园区固定型", "share": 25, "avgEnergy": "74 kWh", "flexibility": "高"},
        ],
        "forecast": {
            "region4h": {
                "title": "未来4小时区域负荷预测",
                "labels": ["10:00", "11:00", "12:00", "13:00"],
                "primary": [10.8, 11.4, 12.5, 12.2],
                "secondary": [10.5, 11.0, 12.1, 11.9],
            },
            "station24h": {
                "title": "重点场站未来24小时预测",
                "labels": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
                "primary": [6.1, 5.7, 8.8, 12.5, 10.6, 14.1],
                "secondary": [6.0, 5.6, 8.4, 12.0, 10.2, 13.3],
            },
            "mediumLong": {
                "title": "月度/年度中长期趋势",
                "labels": ["2026-04", "2026-05", "2026-06", "2026-Q3", "2026-Q4", "2027"],
                "primary": [372, 388, 401, 418, 436, 468],
                "secondary": [365, 381, 394, 410, 426, 452],
            },
        },
    },
    "summer": {
        "name": "迎峰夏季",
        "volatility": 0.38,
        "impact": 0.57,
        "cluster": "夜谷承接型",
        "shiftable_mwh": 24.3,
        "reducible_mw": 2.8,
        "benefit_wan": 0.88,
        "segments": [
            {"name": "跨省长途型", "share": 43, "avgEnergy": "138 kWh", "flexibility": "中"},
            {"name": "区域配送型", "share": 33, "avgEnergy": "82 kWh", "flexibility": "中高"},
            {"name": "园区固定型", "share": 24, "avgEnergy": "72 kWh", "flexibility": "高"},
        ],
        "forecast": {
            "region4h": {
                "title": "未来4小时区域负荷预测",
                "labels": ["18:00", "19:00", "20:00", "21:00"],
                "primary": [14.5, 15.0, 15.9, 16.4],
                "secondary": [14.1, 14.7, 15.3, 15.8],
            },
            "station24h": {
                "title": "重点场站未来24小时预测",
                "labels": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
                "primary": [8.1, 6.9, 11.3, 12.6, 12.8, 16.4],
                "secondary": [7.9, 6.8, 11.0, 12.2, 12.2, 15.9],
            },
            "mediumLong": {
                "title": "月度/年度中长期趋势",
                "labels": ["2026-07", "2026-08", "2026-09", "2026-Q4", "2027-Q1", "2027"],
                "primary": [416, 423, 395, 438, 462, 498],
                "secondary": [410, 418, 388, 430, 450, 486],
            },
        },
    },
    "weekend": {
        "name": "周末低活跃",
        "volatility": 0.19,
        "impact": 0.22,
        "cluster": "低活跃平稳型",
        "shiftable_mwh": 19.7,
        "reducible_mw": 1.4,
        "benefit_wan": 0.57,
        "segments": [
            {"name": "园区固定型", "share": 37, "avgEnergy": "76 kWh", "flexibility": "高"},
            {"name": "区域配送型", "share": 35, "avgEnergy": "79 kWh", "flexibility": "中高"},
            {"name": "跨省长途型", "share": 28, "avgEnergy": "120 kWh", "flexibility": "中"},
        ],
        "forecast": {
            "region4h": {
                "title": "未来4小时区域负荷预测",
                "labels": ["16:00", "17:00", "18:00", "19:00"],
                "primary": [6.9, 7.4, 8.9, 10.2],
                "secondary": [6.8, 7.1, 8.4, 9.6],
            },
            "station24h": {
                "title": "重点场站未来24小时预测",
                "labels": ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
                "primary": [4.9, 4.4, 6.0, 7.7, 6.9, 9.1],
                "secondary": [4.8, 4.3, 5.8, 7.4, 6.7, 8.7],
            },
            "mediumLong": {
                "title": "月度/年度中长期趋势",
                "labels": ["2026-05", "2026-06", "2026-07", "2026-Q3", "2026-Q4", "2027"],
                "primary": [288, 301, 318, 326, 339, 358],
                "secondary": [282, 296, 311, 320, 332, 350],
            },
        },
    },
}

STATION_NAME_MAP = {
    "phonecity": "长勺北路手机城充电站",
    "fengchengtech": "凤城科技园充电站",
    "xinghecheng": "星河城停车场充电站",
    "development": "开发区管委会充电站",
    "laibei": "张家洼莱北充电站",
    "jintai": "金泰充电站",
    "jinghu": "G2京沪高速莱芜服务区",
    "fengcheng": "凤城科技园充电站",
    "gangcheng": "金泰充电站",
    "kouzhen": "G2京沪高速莱芜服务区",
    "gaoxin": "开发区管委会充电站",
}

STATION_TRAITS = {
    "phonecity": {"longway": 14, "region": 42, "park": 24, "trips": 25, "load_share": "12.8%"},
    "fengchengtech": {"longway": 24, "region": 44, "park": 32, "trips": 29, "load_share": "14.2%"},
    "xinghecheng": {"longway": 12, "region": 30, "park": 58, "trips": 20, "load_share": "10.6%"},
    "development": {"longway": 18, "region": 53, "park": 29, "trips": 32, "load_share": "15.4%"},
    "laibei": {"longway": 15, "region": 27, "park": 58, "trips": 21, "load_share": "10.1%"},
    "jintai": {"longway": 52, "region": 30, "park": 18, "trips": 27, "load_share": "13.7%"},
    "jinghu": {"longway": 56, "region": 29, "park": 15, "trips": 24, "load_share": "12.1%"},
    "fengcheng": {"longway": 24, "region": 44, "park": 32, "trips": 29, "load_share": "14.2%"},
    "gangcheng": {"longway": 52, "region": 30, "park": 18, "trips": 27, "load_share": "13.7%"},
    "kouzhen": {"longway": 56, "region": 29, "park": 15, "trips": 24, "load_share": "12.1%"},
    "gaoxin": {"longway": 18, "region": 53, "park": 29, "trips": 32, "load_share": "15.4%"},
}

SEGMENT_COLORS = {
    "区域配送型": "#b9e769",
    "跨省长途型": "#68d6c9",
    "园区固定型": "#ffbd59",
}

SEGMENT_WINDOWS = {
    "区域配送型": "16:00-18:00",
    "跨省长途型": "18:00-24:00",
    "园区固定型": "11:00-14:00",
}

FLEXIBILITY_SCORES = {"高": 88, "中高": 72, "中": 56, "低": 40}


def _scenario(key: str) -> dict:
    return SCENARIO_FACTORS.get(key, SCENARIO_FACTORS["spring"])


def _now() -> str:
    return datetime.now().isoformat(timespec="seconds")


def _segment_key(name: str) -> str:
    if "长途" in name:
        return "longway"
    if "配送" in name:
        return "region"
    return "park"


def _segment_share(station_id: str, segment_name: str) -> int:
    traits = STATION_TRAITS.get(station_id, STATION_TRAITS["fengcheng"])
    return traits[_segment_key(segment_name)]


def _energy_value(label: str) -> int:
    return int(str(label).split()[0])


def _station_portraits(station_ids: list[str], segments: list[dict], station_forecast: list[dict]) -> list[dict]:
    forecast_map = {item["stationId"]: item for item in station_forecast}
    portraits = []
    for station_id in station_ids:
        traits = STATION_TRAITS.get(station_id, STATION_TRAITS["fengcheng"])
        segment_rows = [
            {
                "key": _segment_key(segment["name"]),
                "name": segment["name"],
                "shortName": segment["name"].replace("型", ""),
                "share": _segment_share(station_id, segment["name"]),
                "color": SEGMENT_COLORS.get(segment["name"], "#6f9be8"),
            }
            for segment in segments
        ]
        dominant = max(segment_rows, key=lambda item: item["share"])
        avg_energy = round(
            sum(item["share"] * _energy_value(segment["avgEnergy"]) for item, segment in zip(segment_rows, segments))
            / 100
        )
        flexible_share = sum(
            item["share"]
            for item, segment in zip(segment_rows, segments)
            if segment.get("flexibility") in {"高", "中高"}
        )
        flexibility_score = round(
            sum(
                item["share"] * FLEXIBILITY_SCORES.get(segment.get("flexibility", "中"), 50)
                for item, segment in zip(segment_rows, segments)
            )
            / 100
        )
        forecast = forecast_map.get(station_id, {})
        portraits.append(
            {
                "stationId": station_id,
                "stationName": STATION_NAME_MAP.get(station_id, station_id),
                "dominantSegment": dominant["name"],
                "peakWindow": forecast.get("peakWindow") or SEGMENT_WINDOWS.get(dominant["name"], "待识别"),
                "activeTrips": traits["trips"],
                "avgEnergy": f"{avg_energy} kWh",
                "flexibleShare": f"{flexible_share}%",
                "flexibilityScore": f"{flexibility_score}分",
                "loadShare": traits["load_share"],
                "demandMwh": forecast.get("demandMwh"),
                "segments": segment_rows,
            }
        )
    return portraits


def health_payload() -> dict:
    return {
        "status": "UP",
        "service": "prototype-algorithm",
        "generatedAt": _now(),
        "modules": ["loadProfile", "userProfile", "flexibility", "forecast"],
    }


def summarize_load_profile(payload: LoadProfileRequest) -> dict:
    config = _scenario(payload.scenario_key)
    focus_station = payload.focus_station or "凤城物流园站"
    return {
        "status": "OK",
        "module": "loadProfile",
        "scenarioKey": payload.scenario_key,
        "generatedAt": _now(),
        "summary": {
            "focusStation": focus_station,
            "typicalCluster": config["cluster"],
            "volatilityIndex": round(config["volatility"] * 100, 1),
            "impactIndex": round(config["impact"] * 100, 1),
        },
        "tags": [
            "时序特征评估",
            "波动性评估",
            "冲击性评估",
            "负荷曲线聚类",
        ],
        "trend": {
            "labels": ["08:00", "10:00", "12:00", "14:00", "18:00", "20:00"],
            "load": [
                round(config["volatility"] * 20 + 5.4, 1),
                round(config["volatility"] * 22 + 6.1, 1),
                round(config["impact"] * 18 + 7.5, 1),
                round(config["impact"] * 16 + 7.1, 1),
                round(config["impact"] * 24 + 8.3, 1),
                round(config["volatility"] * 19 + 7.6, 1),
            ],
            "baseline": [5.6, 6.3, 7.4, 7.0, 8.4, 7.8],
        },
    }


def predict_user_profile(payload: UserProfileRequest) -> dict:
    config = _scenario(payload.scenario_key)
    segments = config["segments"]
    station_ids = payload.station_ids or ["fengcheng", "gangcheng", "kouzhen", "gaoxin"]
    station_forecast = [
        {
            "stationId": station_id,
            "stationName": STATION_NAME_MAP.get(station_id, station_id),
            "demandMwh": round(6.8 + index * 1.1 + config["impact"] * 4, 1),
            "peakWindow": ["10:00-12:00", "18:00-20:00", "12:00-14:00", "19:00-21:00"][index % 4],
        }
        for index, station_id in enumerate(station_ids)
    ]
    return {
        "status": "OK",
        "module": "userProfile",
        "scenarioKey": payload.scenario_key,
        "generatedAt": _now(),
        "horizonHours": payload.horizon_hours,
        "segments": segments,
        "stationPortraits": _station_portraits(station_ids, segments, station_forecast),
        "demandPrediction": {
            "labels": ["T+1", "T+2", "T+3", "T+4"],
            "totalDemand": [round(9.6 + config["impact"] * n, 1) for n in [10, 12, 14, 13]],
            "baseline": [9.2, 9.8, 10.4, 10.1],
            "stationForecast": station_forecast,
        },
    }


def evaluate_flexibility(payload: FlexibilityRequest) -> dict:
    config = _scenario(payload.scenario_key)
    service_factor = payload.service_guard / 100
    price_factor = payload.price_spread
    shiftable = round(config["shiftable_mwh"] * (1 - (service_factor - 0.72) * 0.55), 1)
    reducible = round(config["reducible_mw"] * (0.95 + price_factor * 0.12), 1)
    benefit = round(config["benefit_wan"] * (0.85 + price_factor * 0.3), 2)
    return {
        "status": "OK",
        "module": "flexibility",
        "scenarioKey": payload.scenario_key,
        "generatedAt": _now(),
        "summary": {
            "serviceGuard": payload.service_guard,
            "priceSpread": payload.price_spread,
            "shiftableEnergyMwh": shiftable,
            "reduciblePowerMw": reducible,
            "expectedBenefitWan": benefit,
        },
        "curve": {
            "labels": ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
            "before": [10.2, 12.6, 12.8, 11.9, 14.9, 15.3],
            "after": [
                round(value - delta, 1)
                for value, delta in zip(
                    [10.2, 12.6, 12.8, 11.9, 14.9, 15.3],
                    [0.1, 0.4, 0.8, 0.5, 1.1, 0.9],
                )
            ],
        },
        "recommendations": [
            "优先将低时效订单转移至低谷窗口",
            "对高风险站点采用分档功率控制",
            "保留基础服务裕度，避免过度削减",
        ],
    }


def predict_forecast(payload: ForecastRequest) -> dict:
    config = _scenario(payload.scenario_key)
    view_key = {
        ("region", "4h"): "region4h",
        ("station", "24h"): "station24h",
        ("mediumLong", "month"): "mediumLong",
    }.get((payload.scope, payload.horizon), "region4h")
    view = config["forecast"][view_key]
    return {
        "status": "OK",
        "module": "forecast",
        "scenarioKey": payload.scenario_key,
        "generatedAt": _now(),
        "scope": payload.scope,
        "horizon": payload.horizon,
        "view": view,
        "accuracy": {
            "mape": round(4.2 + config["volatility"] * 3, 2),
            "rmse": round(0.48 + config["impact"] * 0.7, 2),
        },
    }
