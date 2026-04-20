# laiwu 联调说明

## 目录

- 前端：`/Users/apricity99/Documents/C_项目竞赛/莱芜电网/laiwu/laiwu_vue版`
- Java 后端：`/Users/apricity99/Documents/C_项目竞赛/莱芜电网/laiwu/laiwu_backend_java`
- Python 算法服务：`/Users/apricity99/Documents/C_项目竞赛/莱芜电网/laiwu/laiwu_algo_python`

## 技术栈

- 前端：`Vue 3 + Vite + Pinia + Vue Router + ECharts`
- 后端：`Spring Boot`
- 算法服务：`Python + FastAPI`
- 数据库预留：`PostgreSQL`

## 联调顺序

1. 启动 Python 算法服务，默认端口 `8000`
2. 启动 Java 后端，默认端口 `8080`
3. 启动前端，并设置 `VITE_API_BASE_URL=http://localhost:8080/api`

## 接口关系

- 前端场景数据：
  - `GET /api/dashboard/scenarios/{scenarioKey}`
- Java 转发到 Python 的算法接口：
  - `POST /api/integration/algorithm/load-profile/analyze`
  - `POST /api/integration/algorithm/user-profile/predict`
  - `POST /api/integration/algorithm/flexibility/evaluate`
  - `POST /api/integration/algorithm/forecast/predict`
- Python 原始接口：
  - `GET /api/health`
  - `POST /api/load-profile/analyze`
  - `POST /api/user-profile/predict`
  - `POST /api/flexibility/evaluate`
  - `POST /api/forecast/predict`

## 请求体样例

### 负荷画像分析

```json
{
  "scenarioKey": "spring",
  "focusStation": "fengcheng",
  "stationIds": ["fengcheng", "gangcheng", "kouzhen", "gaoxin"]
}
```

### 用户画像与行为预测

```json
{
  "scenarioKey": "spring",
  "stationIds": ["fengcheng", "gangcheng", "kouzhen", "gaoxin"],
  "horizonHours": 4
}
```

### 调节潜力评估

```json
{
  "scenarioKey": "spring",
  "serviceGuard": 90,
  "priceSpread": 0.82
}
```

### 负荷预测

```json
{
  "scenarioKey": "spring",
  "scope": "region",
  "horizon": "4h"
}
```

## 说明

- 前端当前默认使用本地模拟数据，可在没有后端的情况下直接演示
- Java 后端已内置 `spring`、`summer`、`weekend` 三个场景 JSON
- Python 算法服务当前返回结构化模拟结果，便于前后端先联通接口，再替换真实模型逻辑
- 当前前端已接入五类联调页面：负荷画像、用户画像、调节潜力、负荷预测、辅助决策应用
- Java 后端已补 Swagger 文档入口，启动后可通过 `/swagger-ui/index.html` 查看接口说明
- 当前环境缺少 `node/npm` 与 `maven`，因此未在本机完成前端和 Java 启动验证
