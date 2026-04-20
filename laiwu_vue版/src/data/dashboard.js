export const modules = [
  { path: "/", key: "overview", title: "总览驾驶舱", desc: "全局指标、趋势、预警与模块入口" },
  { path: "/governance", key: "governance", title: "多源数据整合与治理", desc: "多源接入、治理规则、数据服务" },
  { path: "/load-profile", key: "loadProfile", title: "多维度负荷特征画像构建", desc: "时序特征、波动冲击、聚类画像" },
  { path: "/forecast", key: "forecast", title: "多维充电负荷预测", desc: "超短期与中长期预测" },
  { path: "/user-profile", key: "userProfile", title: "重卡用户群体画像与行为预测", desc: "用户分群、行为规律、短期需求" },
  { path: "/flexibility", key: "flexibility", title: "调节潜力分析与量化评估", desc: "可平移、可削减与经济性评估" },
  { path: "/decision", key: "decision", title: "辅助决策数据应用", desc: "成果综合展示、预警与策略应用" },
  { path: "/map-station-management", key: "mapStationManagement", title: "充电站一览图", desc: "充电站地图、站点台账和使用状态" },
  { path: "/map-site-analysis", key: "mapSiteAnalysis", title: "充电站接入规划管理", desc: "乡镇三色图、趋势研判和选址建议" }
];

const hourLabels = Array.from({ length: 24 }, (_, index) => `${String(index).padStart(2, "0")}:00`);

const laiwuDistricts = [
  { id: "370116", label: "莱芜区", center: [117.675808, 36.214395] },
  { id: "370117", label: "钢城区", center: [117.82033, 36.058038] }
];

const laiwuStationCatalog = [
  {
    id: "phonecity",
    name: "长勺北路手机城充电站",
    mapLabel: "手机城",
    district: "莱芜区",
    townshipKey: "fengcheng",
    lng: 117.676,
    lat: 36.214,
    operator: "国网充电",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "院内集中式",
    chargeFee: "按峰谷电价执行",
    serviceFee: "0.8元/度",
    payment: "国网充电卡/e充电APP",
    address: "莱芜市莱城区长勺北路158号手机城院内",
    sceneType: "城区商业站"
  },
  {
    id: "fengchengtech",
    name: "凤城科技园充电站",
    mapLabel: "凤城科技园",
    district: "莱芜区",
    townshipKey: "fengcheng",
    lng: 117.639,
    lat: 36.208,
    operator: "国网充电",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "园区集中式",
    chargeFee: "按峰谷电价执行",
    serviceFee: "0.8元/度",
    payment: "国网充电卡/e充电APP",
    address: "莱芜市莱城区凤城西大街518号凤城科技园处",
    sceneType: "园区站"
  },
  {
    id: "xinghecheng",
    name: "星河城停车场充电站",
    mapLabel: "星河城",
    district: "莱芜区",
    townshipKey: "pengquan",
    lng: 117.734,
    lat: 36.214,
    operator: "国网充电",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "小区停车场",
    chargeFee: "按峰谷电价执行",
    serviceFee: "0.8元/度",
    payment: "国网充电卡/e充电APP",
    address: "莱芜市开发区龙潭东大街338号星河城小区处",
    sceneType: "社区站"
  },
  {
    id: "development",
    name: "开发区管委会充电站",
    mapLabel: "开发区管委会",
    district: "莱芜区",
    townshipKey: "gaozhuang",
    lng: 117.704,
    lat: 36.19,
    operator: "国网充电",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "政务园区",
    chargeFee: "按峰谷电价执行",
    serviceFee: "0.8元/度",
    payment: "国网充电卡/e充电APP",
    address: "莱芜市开发区汇源大街108号创业中心院内",
    sceneType: "政务园区站"
  },
  {
    id: "laibei",
    name: "张家洼莱北充电站",
    mapLabel: "莱北",
    district: "莱芜区",
    townshipKey: "zhangjiawa",
    lng: 117.62,
    lat: 36.26,
    operator: "国网充电",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "厂区周边",
    chargeFee: "按峰谷电价执行",
    serviceFee: "0.8元/度",
    payment: "国网充电卡/e充电APP",
    address: "莱芜市莱城区张家洼街道办事处新兴路长龙钢铁处",
    sceneType: "工业配套站"
  },
  {
    id: "jintai",
    name: "金泰充电站",
    mapLabel: "金泰",
    district: "钢城区",
    townshipKey: "wenyuan",
    lng: 117.894858,
    lat: 36.061941,
    operator: "特来电",
    operationStatus: "已投运",
    fast: 2,
    slow: 3,
    distribution: "单侧集中式",
    chargeFee: "00:00-24:00 1.2000元/度",
    serviceFee: "00:00-24:00 0.6000元/小时",
    payment: "特来电APP",
    address: "山东省莱芜市钢城区汶源街道黄庄一村",
    sceneType: "钢城枢纽站"
  },
  {
    id: "jinghu",
    name: "G2京沪高速莱芜服务区",
    mapLabel: "京沪服务区",
    district: "莱芜区",
    townshipKey: "kouzhen",
    lng: 117.616574,
    lat: 36.317316,
    operator: "待补充",
    operationStatus: "已投运",
    fast: 8,
    slow: 0,
    distribution: "双侧",
    chargeFee: "待补充",
    serviceFee: "待补充",
    payment: "待补充",
    address: "莱芜高速服务区",
    sceneType: "高速服务区"
  }
];

const defaultStationState = {
  load: 2.6,
  use: 58,
  shift: 4.0,
  status: "平稳运行",
  cluster: "综合服务型"
};

const townshipHistoryLabels = ["2021", "2022", "2023", "2024", "2025", "2026"];

function makeTownship(key, name, district, energySeries, utilization, recommendation, reason) {
  return { key, name, district, energySeries, utilization, recommendation, reason };
}

function getCurrentTownshipPileCount(townshipKey) {
  return laiwuStationCatalog
    .filter((item) => item.townshipKey === townshipKey)
    .reduce((sum, item) => sum + (item.fast || 0) + (item.slow || 0), 0);
}

function buildTownshipPileSeries(townshipKey) {
  const pileCount = getCurrentTownshipPileCount(townshipKey);
  return Array.from({ length: townshipHistoryLabels.length }, () => pileCount || 0);
}

const defaultTownshipHistory = [
  makeTownship("fengcheng", "凤城街道", "莱城区", [16, 19, 24, 28, 33, 38], 82, "建议优化城区站点布局", "城区补能需求持续增长，建议结合停车场资源加密布点。"),
  makeTownship("pengquan", "鹏泉街道", "莱城区", [9, 12, 17, 21, 26, 30], 78, "建议新增补能节点", "园区及居住区混合需求增长较快，现有站点覆盖不足。"),
  makeTownship("gaozhuang", "高庄街道", "莱城区", [8, 11, 16, 22, 29, 36], 84, "建议新增快充站点", "近两年充电量抬升明显，开发区周边承载压力较高。"),
  makeTownship("zhangjiawa", "张家洼街道", "莱城区", [10, 13, 17, 23, 27, 31], 72, "建议持续观察", "现有站点仍可承接，但工业周边补能需求持续增加。"),
  makeTownship("kouzhen", "口镇", "莱城区", [4, 7, 9, 12, 18, 24], 79, "具备新增布点条件", "近三年充电量提升幅度较大。"),
  makeTownship("hezhuang", "和庄镇", "莱城区", [3, 4, 7, 9, 12, 16], 67, "建议预留用地", "当前需求平稳增长，可结合物流通道预留站点空间。"),
  makeTownship("zhaili", "寨里镇", "莱城区", [3, 5, 7, 8, 11, 15], 69, "建议持续观察", "当前利用率未到预警，但近两年增长明显。"),
  makeTownship("miaoshan", "苗山镇", "莱城区", [2, 3, 5, 7, 9, 12], 58, "暂以观察为主", "现有需求仍偏低，适合以周边站点覆盖为主。"),
  makeTownship("dawangzhuang", "大王庄镇", "莱城区", [1, 2, 3, 5, 7, 9], 52, "暂不建议新增", "当前需求规模较小，优先观察道路货运需求变化。"),
  makeTownship("yangzhuang", "杨庄镇", "莱城区", [2, 4, 6, 9, 11, 15], 64, "建议阶段性评估", "中短期增长平稳，可纳入下一轮布点评估。"),
  makeTownship("fangxia", "方下镇", "莱城区", [4, 6, 9, 13, 16, 20], 73, "建议增加站点能力", "物流及工业运输需求抬升，现有站点边际承压。"),
  makeTownship("chayekou", "茶业口镇", "莱城区", [1, 2, 2, 4, 5, 7], 46, "维持现状", "需求较低，暂不建议新增固定站点。"),
  makeTownship("xueye", "雪野镇", "莱城区", [3, 5, 7, 10, 14, 19], 71, "建议补充服务型站点", "旅游与周末补能需求抬升，适合配置服务型站点。"),
  makeTownship("yangli", "羊里镇", "莱城区", [2, 3, 5, 6, 8, 10], 55, "维持观察", "当前需求增速一般，可继续观察周边通道变化。"),
  makeTownship("niuquan", "牛泉镇", "莱城区", [2, 3, 5, 7, 10, 14], 63, "建议预留扩展能力", "若工业运输需求继续提升，可在既有站点基础上扩容。"),
  makeTownship("aishan", "艾山街道", "钢城区", [5, 8, 11, 14, 19, 24], 81, "建议新增站点", "钢城片区补能需求持续上升，现有承载压力偏高。"),
  makeTownship("wenyuan", "汶源街道", "钢城区", [7, 10, 14, 19, 24, 30], 88, "建议优先增容并新增布点", "当前已处红色受限区，需同时考虑扩容和增站。"),
  makeTownship("lixin", "里辛街道", "钢城区", [4, 6, 9, 12, 16, 21], 77, "建议纳入近期建设计划", "需求增长明显，适合在工业运输节点新增站点。"),
  makeTownship("yanzhuang", "颜庄镇", "钢城区", [3, 4, 6, 9, 13, 17], 69, "建议观察后布点", "增速较快但利用率未到预警，适合预留资源。"),
  makeTownship("xinzhuang", "辛庄镇", "钢城区", [2, 3, 6, 9, 13, 19], 86, "建议优先新增站点", "当前需求处于高增长阶段，现有站点支撑不足。")
];

function createScenario({
  title,
  note,
  metrics,
  meta,
  actual,
  forecast,
  stationLoads,
  strategies,
  alerts,
  governanceSources,
  segments,
  forecastViews,
  actionViews,
  districtLoads,
  townshipHistory
}) {
  const stationStateMap = Array.isArray(stationLoads)
    ? Object.fromEntries(laiwuStationCatalog.map((item, index) => [item.id, stationLoads[index] || defaultStationState]))
    : stationLoads;

  const stations = laiwuStationCatalog.map((item) => ({
    ...item,
    ...defaultStationState,
    ...(stationStateMap[item.id] || {})
  }));

  return {
    title,
    note,
    metrics,
    meta,
    loadSeries: {
      labels: hourLabels,
      actual,
      forecast
    },
    governanceSources,
    stations,
    strategies: strategies || [
      { level: "优先执行", name: "午间深谷增充", action: "释放可延后订单并提升可用功率，引导凤城科技园充电站与张家洼莱北充电站承接午间负荷。", gain: "预计增充 6.8 MWh" },
      { level: "滚动跟踪", name: "晚高峰预降载", action: "对开发区管委会充电站启用分批排队与柔性功率控制，平滑 18:00 后峰值抬升。", gain: "峰值降低约 1.2 MW" }
    ],
    alerts: alerts || [
      { time: "10:40", title: "午间深谷窗口即将开启", text: "建议将可延迟订单调整至 11:00 后开始补能，提高深谷承接比例。" },
      { time: "18:50", title: "开发区管委会充电站晚高峰抬升", text: "预测并发负荷将突破阈值，建议提前下发功率控制策略。" },
      { time: "19:20", title: "金泰充电站进入重点观察", text: "站点利用率持续偏高，建议同步释放周边站点预约分流能力。" }
    ],
    segments,
    forecastViews,
    actionViews,
    mapTopic: {
      districts: laiwuDistricts.map((item, index) => ({
        ...item,
        energy: districtLoads[index].energy,
        utilization: districtLoads[index].utilization,
        note: districtLoads[index].note
      })),
      townshipLabels: townshipHistoryLabels,
      townships: (townshipHistory || defaultTownshipHistory).map((item) => ({
        ...item,
        pileSeries: buildTownshipPileSeries(item.key)
      }))
    }
  };
}

const SEGMENT_COLORS = {
  region: "#b9e769",
  longway: "#68d6c9",
  park: "#ffbd59"
};

const FLEXIBILITY_SCORES = {
  高: 88,
  中高: 72,
  中: 56,
  低: 40
};

const TIME_WINDOW_LABELS = {
  凌晨补能: "00:00-06:00",
  夜间集中: "18:00-24:00",
  白天补能: "08:00-18:00",
  上午补能: "06:00-11:00",
  午间补能: "11:00-14:00",
  下午补能: "14:00-17:00",
  晚高峰前: "16:00-18:00",
  晚间补能: "18:00-22:00"
};

function parseNumber(value) {
  const matched = `${value ?? ""}`.match(/[\d.]+/);
  return matched ? Number(matched[0]) : 0;
}

function roundShares(items) {
  const total = items.reduce((sum, item) => sum + item.score, 0) || 1;
  const withRaw = items.map((item) => {
    const raw = (item.score / total) * 100;
    return { ...item, raw, share: Math.floor(raw), remainder: raw - Math.floor(raw) };
  });
  let remainder = 100 - withRaw.reduce((sum, item) => sum + item.share, 0);
  withRaw
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((item) => {
      if (remainder <= 0) return;
      item.share += 1;
      remainder -= 1;
    });
  return withRaw;
}

function getSegmentColor(segment) {
  return segment.color || SEGMENT_COLORS[segment.key] || "#6f9be8";
}

function getClusterAffinity(station, segment) {
  const hint = `${station.cluster || ""}${station.sceneType || ""}`;
  if (segment.label.includes("长途")) {
    if (/长途|高速|夜谷|枢纽/.test(hint)) return 16;
    if (/钢城/.test(hint)) return 8;
    return 0;
  }
  if (segment.label.includes("配送")) {
    if (/峰段|混合|城区|政务|商业/.test(hint)) return 12;
    return 4;
  }
  if (segment.label.includes("园区")) {
    if (/午间|谷段|园区|工业|社区/.test(hint)) return 14;
    return 3;
  }
  return 0;
}

function getPeakWindow(segment) {
  const topPref = [...(segment.timePrefs || [])].sort((a, b) => b.share - a.share)[0];
  return TIME_WINDOW_LABELS[topPref?.name] || topPref?.name || "待识别";
}

export function buildStationUserProfiles(scenario, segments = scenario?.segments || []) {
  if (!scenario?.stations?.length || !segments.length) return [];

  const totalLoad = scenario.stations.reduce((sum, item) => sum + Number(item.load || 0), 0) || 1;

  return scenario.stations
    .map((station) => {
      const scoredSegments = roundShares(
        segments.map((segment) => {
          const prefShare = segment.stationPrefs?.find((item) => item.name === station.name)?.share || 0;
          const score = Math.max(6, prefShare + getClusterAffinity(station, segment) + (segment.share || 0) * 0.25);
          return { segment, score };
        })
      );

      const dominant = [...scoredSegments].sort((a, b) => b.share - a.share)[0];
      const avgEnergy = Math.round(
        scoredSegments.reduce((sum, item) => sum + item.share * parseNumber(item.segment.avgEnergy), 0) / 100
      );
      const flexibilityScore = Math.round(
        scoredSegments.reduce(
          (sum, item) => sum + item.share * (FLEXIBILITY_SCORES[item.segment.flexibility] || 50),
          0
        ) / 100
      );
      const flexibleShare = scoredSegments
        .filter((item) => ["高", "中高"].includes(item.segment.flexibility))
        .reduce((sum, item) => sum + item.share, 0);

      return {
        stationId: station.id,
        stationName: station.name,
        dominantSegment: dominant.segment.label,
        peakWindow: getPeakWindow(dominant.segment),
        activeTrips: Math.max(8, Math.round(Number(station.load || 0) * 4.8 + Number(station.use || 0) * 0.18)),
        avgEnergy: `${avgEnergy} kWh`,
        flexibleShare: `${flexibleShare}%`,
        flexibilityScore: `${flexibilityScore}分`,
        loadShare: `${((Number(station.load || 0) / totalLoad) * 100).toFixed(1)}%`,
        segments: scoredSegments.map((item) => ({
          key: item.segment.key,
          name: item.segment.label,
          shortName: item.segment.label.replace("型", ""),
          share: item.share,
          color: getSegmentColor(item.segment)
        }))
      };
    })
    .sort((a, b) => parseNumber(b.loadShare) - parseNumber(a.loadShare) || b.activeTrips - a.activeTrips);
}

export const scenarios = {
  spring: createScenario({
    title: "春秋工作日场景",
    note: "模拟日期：2026-04-08，午间深谷窗口明显，适合展示新能源友好消纳与错峰引导。",
    metrics: [
      { label: "当日总充电量", value: "118.4", unit: "MWh", sub: "订单 1,286 笔" },
      { label: "预测峰值负荷", value: "14.8", unit: "MW", sub: "19:30 达到峰值" },
      { label: "可平移电量", value: "28.6", unit: "MWh", sub: "午间深谷引导" },
      { label: "预估单日节省", value: "0.93", unit: "万元", sub: "基于价差测算" }
    ],
    meta: [
      { label: "场景特征", value: "春秋谷段", desc: "11:00-14:00 存在深谷窗口" },
      { label: "重点区域", value: "莱芜城区", desc: "站点利用率分化明显" },
      { label: "状态口径", value: "模拟数据", desc: "用于原型汇报展示" }
    ],
    actual: [6.2, 5.8, 5.5, 5.3, 5.6, 6.1, 6.8, 7.9, 8.6, 9.4, 10.8, 11.6, 12.1, 11.8, 11.2, 10.7, 10.1, 11.0, 12.6, 13.8, 13.1, 11.9, 9.8, 7.5],
    forecast: [6.1, 5.9, 5.5, 5.4, 5.7, 6.2, 6.9, 8.1, 8.8, 9.8, 10.5, 11.4, 12.5, 12.2, 11.5, 10.9, 10.6, 11.7, 13.4, 14.8, 14.1, 12.4, 10.2, 7.9],
    stationLoads: {
      phonecity: { load: 3.9, use: 76, shift: 6.4, status: "城区平稳", cluster: "混合运营型" },
      fengchengtech: { load: 4.2, use: 79, shift: 8.1, status: "建议增充", cluster: "午间消纳型" },
      xinghecheng: { load: 3.1, use: 68, shift: 5.6, status: "可承接补能", cluster: "综合服务型" },
      development: { load: 4.5, use: 88, shift: 3.4, status: "晚峰观察", cluster: "峰段敏感型" },
      laibei: { load: 3.0, use: 63, shift: 7.8, status: "可平移强", cluster: "谷段承接型" },
      jintai: { load: 3.8, use: 86, shift: 4.2, status: "重点观察", cluster: "峰段敏感型" },
      jinghu: { load: 3.5, use: 71, shift: 5.1, status: "高速平稳", cluster: "长途补能型" }
    },
    governanceSources: [
      {
        key: "realtime",
        name: "实时充电数据",
        freshness: "15秒",
        quality: "98.6%",
        output: "站点分钟级负荷服务",
        rules: "设备状态、功率连续性、站点编码映射",
        trend: {
          labels: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"],
          primary: [96.8, 97.2, 97.6, 98.0, 98.3, 98.6],
          secondary: [14, 12, 10, 9, 7, 6]
        }
      },
      {
        key: "history",
        name: "历史运行数据",
        freshness: "T+1",
        quality: "97.9%",
        output: "订单行为主题宽表",
        rules: "订单闭环、时长异常、充电量异常",
        trend: {
          labels: ["D-5", "D-4", "D-3", "D-2", "D-1", "D0"],
          primary: [96.2, 96.8, 97.1, 97.4, 97.7, 97.9],
          secondary: [21, 18, 14, 11, 9, 8]
        }
      },
      {
        key: "external",
        name: "天气/日期/政策数据",
        freshness: "30分钟",
        quality: "99.1%",
        output: "外部因子特征服务",
        rules: "时间对齐、节假日映射、政策标签",
        trend: {
          labels: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"],
          primary: [97.9, 98.3, 98.6, 98.8, 99.0, 99.1],
          secondary: [7, 6, 5, 4, 3, 2]
        }
      }
    ],
    segments: [
      {
        key: "region",
        label: "区域配送型",
        share: 41,
        basis: "上午/晚前补能明显、频次较高、单次电量中等",
        flexibility: "中高",
        avgEnergy: "86 kWh",
        frequency: "3.4 次/日",
        stationPrefs: [
          { name: "凤城科技园充电站", share: 41 },
          { name: "开发区管委会充电站", share: 32 },
          { name: "张家洼莱北充电站", share: 27 }
        ],
        timePrefs: [
          { name: "上午补能", share: 34 },
          { name: "午间补能", share: 29 },
          { name: "晚高峰前", share: 37 }
        ],
        curve: {
          labels: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"],
          primary: [11.6, 15.9, 13.8, 12.7, 17.4, 14.1],
          secondary: [10.8, 14.5, 12.9, 11.9, 16.3, 13.3]
        }
      },
      {
        key: "longway",
        label: "跨省长途型",
        share: 34,
        basis: "夜间/凌晨充电占比高、单次电量大、日均频次较低",
        flexibility: "中",
        avgEnergy: "132 kWh",
        frequency: "2.1 次/日",
        stationPrefs: [
          { name: "金泰充电站", share: 45 },
          { name: "凤城科技园充电站", share: 33 },
          { name: "G2京沪高速莱芜服务区", share: 22 }
        ],
        timePrefs: [
          { name: "凌晨补能", share: 28 },
          { name: "午间补能", share: 16 },
          { name: "夜间集中", share: 56 }
        ],
        curve: {
          labels: ["00:00", "04:00", "08:00", "12:00", "18:00", "22:00"],
          primary: [14.2, 12.1, 9.4, 8.2, 15.3, 17.1],
          secondary: [13.3, 11.3, 8.7, 7.8, 14.4, 16.0]
        }
      },
      {
        key: "park",
        label: "园区固定型",
        share: 25,
        basis: "午间补能集中、频次高、单次电量稳定",
        flexibility: "高",
        avgEnergy: "74 kWh",
        frequency: "4.2 次/日",
        stationPrefs: [
          { name: "张家洼莱北充电站", share: 46 },
          { name: "凤城科技园充电站", share: 31 },
          { name: "星河城停车场充电站", share: 23 }
        ],
        timePrefs: [
          { name: "上午补能", share: 26 },
          { name: "午间补能", share: 43 },
          { name: "晚间补能", share: 31 }
        ],
        curve: {
          labels: ["07:00", "10:00", "12:00", "14:00", "17:00", "20:00"],
          primary: [8.0, 10.6, 15.0, 13.8, 10.9, 9.5],
          secondary: [7.3, 9.8, 13.9, 12.8, 10.1, 8.8]
        }
      }
    ],
    forecastViews: {
      shortRegion: {
        title: "未来4小时区域负荷预测",
        labels: ["10:00", "11:00", "12:00", "13:00"],
        primary: [10.8, 11.4, 12.5, 12.2],
        secondary: [10.5, 11.0, 12.1, 11.9]
      },
      shortStation: {
        title: "重点场站未来24小时预测",
        labels: hourLabels,
        primary: [6.1, 5.9, 5.5, 5.4, 5.7, 6.2, 6.9, 8.1, 8.8, 9.8, 10.5, 11.4, 12.5, 12.2, 11.5, 10.9, 10.6, 11.7, 13.4, 14.8, 14.1, 12.4, 10.2, 7.9],
        secondary: [6.0, 5.8, 5.4, 5.2, 5.6, 6.0, 6.6, 7.8, 8.4, 9.3, 10.0, 11.1, 12.0, 11.8, 11.1, 10.6, 10.2, 11.1, 12.7, 13.9, 13.3, 11.9, 9.7, 7.3]
      },
      mediumLong: {
        title: "月度/年度中长期趋势",
        labels: ["2026-04", "2026-05", "2026-06", "2026-Q3", "2026-Q4", "2027"],
        primary: [372, 388, 401, 418, 436, 468],
        secondary: [365, 381, 394, 410, 426, 452]
      }
    },
    actionViews: {
      strategy: {
        status: "已生成站点策略包，重点引导凤城科技园充电站与张家洼莱北充电站承接午间深谷负荷。",
        labels: ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
        primary: [10.2, 12.8, 13.1, 12.0, 13.3, 13.9],
        secondary: [10.5, 11.9, 12.0, 12.2, 14.6, 15.0]
      },
      report: {
        status: "已汇总生成运营日报，可导出站点运行、预测偏差和调节收益摘要。",
        labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "D0"],
        primary: [108, 110, 114, 116, 117, 118, 118.4],
        secondary: [104, 108, 111, 113, 115, 116, 117]
      },
      alert: {
        status: "已发布预警通知，金泰充电站与开发区管委会充电站进入重点监测名单。",
        labels: ["08:00", "10:00", "12:00", "14:00", "18:00", "20:00"],
        primary: [48, 55, 61, 58, 82, 88],
        secondary: [62, 62, 62, 62, 62, 62]
      }
    },
    districtLoads: [
      { energy: 91.0, utilization: 76, note: "莱芜区站点分布更集中，承担城区与园区补能主力" },
      { energy: 27.4, utilization: 88, note: "钢城区晚高峰挤兑明显，金泰站需重点观察" }
    ]
  }),
  summer: createScenario({
    title: "迎峰夏季场景",
    note: "模拟日期：2026-07-15，夜间低谷主导，白天受高温与站点热负荷影响较大。",
    metrics: [
      { label: "当日总充电量", value: "132.6", unit: "MWh", sub: "长途订单占比提升" },
      { label: "预测峰值负荷", value: "16.4", unit: "MW", sub: "21:10 出现峰值" },
      { label: "可平移电量", value: "24.3", unit: "MWh", sub: "夜谷引导为主" },
      { label: "预估单日节省", value: "0.88", unit: "万元", sub: "夜间谷段收益稳定" }
    ],
    meta: [
      { label: "场景特征", value: "夏季高温", desc: "夜间低谷更明显" },
      { label: "重点区域", value: "莱芜南部", desc: "长途型用户更集中" },
      { label: "状态口径", value: "模拟数据", desc: "用于季节切换展示" }
    ],
    actual: [8.3, 7.6, 7.1, 6.8, 7.0, 7.9, 9.2, 10.8, 11.6, 12.1, 12.8, 13.0, 12.3, 11.9, 11.5, 11.8, 12.4, 13.1, 14.5, 15.7, 16.1, 15.3, 13.4, 10.2],
    forecast: [8.1, 7.4, 7.0, 6.6, 6.9, 7.8, 9.0, 10.5, 11.3, 11.9, 12.6, 12.9, 12.5, 12.0, 11.8, 12.2, 12.8, 13.6, 15.0, 15.9, 16.4, 15.8, 13.7, 10.9],
    stationLoads: {
      phonecity: { load: 4.1, use: 74, shift: 4.8, status: "城区偏高", cluster: "混合运营型" },
      fengchengtech: { load: 4.7, use: 84, shift: 6.2, status: "夜谷优先", cluster: "谷段承接型" },
      xinghecheng: { load: 3.4, use: 61, shift: 5.1, status: "可承接分流", cluster: "午间消纳型" },
      development: { load: 4.5, use: 88, shift: 4.1, status: "峰段观察", cluster: "混合运营型" },
      laibei: { load: 2.8, use: 55, shift: 5.9, status: "可承接分流", cluster: "午间消纳型" },
      jintai: { load: 5.1, use: 93, shift: 2.6, status: "持续高载", cluster: "峰段敏感型" },
      jinghu: { load: 4.6, use: 81, shift: 4.9, status: "高速夜谷", cluster: "长途补能型" }
    },
    governanceSources: [
      {
        key: "realtime",
        name: "实时充电数据",
        freshness: "10秒",
        quality: "97.8%",
        output: "站点分钟级负荷服务",
        rules: "温升联动、功率连续性、站点编码映射",
        trend: { labels: ["09:00", "09:10", "09:20", "09:30", "09:40", "09:50"], primary: [96.9, 97.1, 97.3, 97.5, 97.6, 97.8], secondary: [16, 15, 14, 12, 11, 10] }
      },
      {
        key: "history",
        name: "历史运行数据",
        freshness: "T+1",
        quality: "97.4%",
        output: "订单行为主题宽表",
        rules: "长途订单识别、时长异常、充电量异常",
        trend: { labels: ["D-5", "D-4", "D-3", "D-2", "D-1", "D0"], primary: [96.8, 97.0, 97.1, 97.2, 97.3, 97.4], secondary: [24, 22, 21, 19, 18, 16] }
      },
      {
        key: "external",
        name: "天气/日期/政策数据",
        freshness: "15分钟",
        quality: "98.7%",
        output: "高温特征因子服务",
        rules: "气温分层、极端天气标注、夜谷标签",
        trend: { labels: ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"], primary: [98.0, 98.2, 98.4, 98.5, 98.6, 98.7], secondary: [9, 8, 7, 6, 5, 4] }
      }
    ],
    segments: [
      {
        key: "longway",
        label: "跨省长途型",
        share: 43,
        basis: "夜间补能集中、单次电量大、补能时长长",
        flexibility: "中",
        avgEnergy: "138 kWh",
        frequency: "2.0 次/日",
        stationPrefs: [{ name: "金泰充电站", share: 47 }, { name: "G2京沪高速莱芜服务区", share: 31 }, { name: "凤城科技园充电站", share: 22 }],
        timePrefs: [{ name: "凌晨补能", share: 26 }, { name: "夜间集中", share: 58 }, { name: "白天补能", share: 16 }],
        curve: { labels: ["00:00", "04:00", "08:00", "12:00", "18:00", "22:00"], primary: [16.1, 14.4, 10.2, 9.1, 16.7, 18.6], secondary: [15.2, 13.4, 9.4, 8.5, 15.4, 17.1] }
      },
      {
        key: "region",
        label: "区域配送型",
        share: 33,
        basis: "上午及傍晚前补能频繁、补能批次密集",
        flexibility: "中高",
        avgEnergy: "82 kWh",
        frequency: "3.8 次/日",
        stationPrefs: [{ name: "凤城科技园充电站", share: 38 }, { name: "开发区管委会充电站", share: 34 }, { name: "张家洼莱北充电站", share: 28 }],
        timePrefs: [{ name: "上午补能", share: 31 }, { name: "下午补能", share: 22 }, { name: "晚高峰前", share: 47 }],
        curve: { labels: ["06:00", "09:00", "12:00", "15:00", "18:00", "21:00"], primary: [12.5, 16.8, 13.9, 13.0, 18.8, 15.7], secondary: [11.6, 15.7, 13.1, 12.3, 17.6, 14.8] }
      },
      {
        key: "park",
        label: "园区固定型",
        share: 24,
        basis: "园区内稳定补能，白天负荷受高温影响明显",
        flexibility: "高",
        avgEnergy: "72 kWh",
        frequency: "4.0 次/日",
        stationPrefs: [{ name: "张家洼莱北充电站", share: 43 }, { name: "凤城科技园充电站", share: 35 }, { name: "星河城停车场充电站", share: 22 }],
        timePrefs: [{ name: "上午补能", share: 28 }, { name: "午间补能", share: 24 }, { name: "晚间补能", share: 48 }],
        curve: { labels: ["07:00", "10:00", "12:00", "14:00", "17:00", "20:00"], primary: [8.5, 10.2, 9.8, 9.4, 12.1, 13.0], secondary: [7.8, 9.6, 9.2, 8.9, 11.2, 12.1] }
      }
    ],
    forecastViews: {
      shortRegion: { title: "未来4小时区域负荷预测", labels: ["18:00", "19:00", "20:00", "21:00"], primary: [14.5, 15.0, 15.9, 16.4], secondary: [14.1, 14.7, 15.3, 15.8] },
      shortStation: { title: "重点场站未来24小时预测", labels: hourLabels, primary: [8.1, 7.4, 7.0, 6.6, 6.9, 7.8, 9.0, 10.5, 11.3, 11.9, 12.6, 12.9, 12.5, 12.0, 11.8, 12.2, 12.8, 13.6, 15.0, 15.9, 16.4, 15.8, 13.7, 10.9], secondary: [7.9, 7.2, 6.8, 6.5, 6.8, 7.5, 8.8, 10.1, 11.0, 11.7, 12.2, 12.5, 12.2, 11.7, 11.4, 11.8, 12.2, 13.0, 14.1, 15.2, 15.9, 15.0, 13.1, 10.4] },
      mediumLong: { title: "月度/年度中长期趋势", labels: ["2026-07", "2026-08", "2026-09", "2026-Q4", "2027-Q1", "2027"], primary: [416, 423, 395, 438, 462, 498], secondary: [410, 418, 388, 430, 450, 486] }
    },
    actionViews: {
      strategy: { status: "已生成夜谷集中补能策略包，重点转移金泰充电站与G2京沪高速莱芜服务区夜间补能负荷。", labels: ["00:00", "04:00", "08:00", "12:00", "18:00", "22:00"], primary: [14.8, 13.7, 10.3, 9.5, 15.4, 17.3], secondary: [13.9, 12.9, 10.7, 10.1, 16.7, 18.4] },
      report: { status: "已生成迎峰夏季运营日报，汇总尖峰压降、夜谷转移及高温影响情况。", labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "D0"], primary: [126, 127, 128, 130, 131, 132, 132.6], secondary: [122, 124, 125, 127, 128, 129, 130] },
      alert: { status: "已发布高温与尖峰复合预警，金泰充电站进入高风险状态。", labels: ["09:00", "12:00", "15:00", "18:00", "20:00", "22:00"], primary: [58, 63, 66, 79, 91, 85], secondary: [62, 62, 62, 62, 62, 62] }
    },
    strategies: [
      { level: "优先执行", name: "夜谷集中补能", action: "释放 01:00-06:00 预约能力，优先承接长途型订单", gain: "预计转移 5.9 MWh" },
      { level: "重点控制", name: "尖峰时段降功率", action: "对持续驻留车辆实施分档限功率策略", gain: "尖峰压降约 1.5 MW" }
    ],
    alerts: [
      { time: "09:20", title: "金泰充电站温升偏高", text: "高温下连续大功率运行超阈值，建议降低单枪并发。" },
      { time: "15:10", title: "长途型用户夜间补能意愿上升", text: "可提前释放夜谷预约名额，提高谷段承接能力。" },
      { time: "20:18", title: "尖峰价格窗口已启动", text: "建议对低时效车辆启用分档降功率策略。" }
    ],
    districtLoads: [
      { energy: 107.0, utilization: 81, note: "莱芜区承接城区、高速与开发区多类补能需求，整体高位运行" },
      { energy: 30.4, utilization: 92, note: "钢城区在夏季高温场景下处于高风险负荷状态" }
    ]
  }),
  weekend: createScenario({
    title: "周末低活跃场景",
    note: "模拟日期：2026-05-17，整体负荷平稳，适合展示异常识别与低负荷策略。",
    metrics: [
      { label: "当日总充电量", value: "84.1", unit: "MWh", sub: "周末需求回落" },
      { label: "预测峰值负荷", value: "10.2", unit: "MW", sub: "18:40 出现小高峰" },
      { label: "可平移电量", value: "19.7", unit: "MWh", sub: "柔性引导空间较大" },
      { label: "预估单日节省", value: "0.57", unit: "万元", sub: "收益下降但调度从容" }
    ],
    meta: [
      { label: "场景特征", value: "周末低活跃", desc: "整体波动较小" },
      { label: "重点区域", value: "园区场景", desc: "固定型用户占比上升" },
      { label: "状态口径", value: "模拟数据", desc: "用于周末口径展示" }
    ],
    actual: [4.8, 4.5, 4.4, 4.3, 4.4, 4.8, 5.1, 5.8, 6.2, 6.6, 7.0, 7.4, 7.8, 7.6, 7.2, 6.9, 6.8, 7.1, 8.4, 9.6, 8.7, 7.6, 6.0, 5.1],
    forecast: [4.9, 4.6, 4.4, 4.2, 4.4, 4.7, 5.0, 5.7, 6.0, 6.4, 6.8, 7.2, 7.7, 7.5, 7.3, 7.0, 6.9, 7.4, 8.9, 10.2, 9.1, 7.8, 6.2, 5.4],
    stationLoads: {
      phonecity: { load: 2.8, use: 56, shift: 4.9, status: "平稳运行", cluster: "谷段承接型" },
      fengchengtech: { load: 3.1, use: 61, shift: 5.4, status: "午间友好", cluster: "午间消纳型" },
      xinghecheng: { load: 2.3, use: 47, shift: 6.1, status: "柔性空间大", cluster: "午间消纳型" },
      development: { load: 3.7, use: 74, shift: 4.0, status: "平稳偏高", cluster: "峰段敏感型" },
      laibei: { load: 2.1, use: 43, shift: 6.6, status: "柔性空间大", cluster: "午间消纳型" },
      jintai: { load: 3.5, use: 72, shift: 4.2, status: "异常观察", cluster: "混合运营型" },
      jinghu: { load: 2.9, use: 59, shift: 4.8, status: "高速平稳", cluster: "长途补能型" }
    },
    governanceSources: [
      {
        key: "realtime",
        name: "实时充电数据",
        freshness: "20秒",
        quality: "98.9%",
        output: "站点分钟级负荷服务",
        rules: "低活跃异常检测、状态连续性、站点编码映射",
        trend: { labels: ["10:00", "10:20", "10:40", "11:00", "11:20", "11:40"], primary: [98.2, 98.4, 98.5, 98.7, 98.8, 98.9], secondary: [8, 7, 6, 5, 4, 4] }
      },
      {
        key: "history",
        name: "历史运行数据",
        freshness: "T+1",
        quality: "98.2%",
        output: "订单行为主题宽表",
        rules: "周末订单标签、时长异常、充电量异常",
        trend: { labels: ["D-5", "D-4", "D-3", "D-2", "D-1", "D0"], primary: [97.6, 97.8, 97.9, 98.0, 98.1, 98.2], secondary: [12, 12, 11, 10, 9, 8] }
      },
      {
        key: "external",
        name: "天气/日期/政策数据",
        freshness: "30分钟",
        quality: "99.3%",
        output: "周末外部因子服务",
        rules: "周末标签、温度补齐、时段映射",
        trend: { labels: ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00"], primary: [98.7, 98.8, 99.0, 99.1, 99.2, 99.3], secondary: [5, 4, 4, 3, 3, 2] }
      }
    ],
    segments: [
      {
        key: "park",
        label: "园区固定型",
        share: 37,
        basis: "午间及下午补能更稳定，时效约束较弱",
        flexibility: "高",
        avgEnergy: "76 kWh",
        frequency: "4.0 次/日",
        stationPrefs: [{ name: "张家洼莱北充电站", share: 42 }, { name: "凤城科技园充电站", share: 33 }, { name: "星河城停车场充电站", share: 25 }],
        timePrefs: [{ name: "上午补能", share: 28 }, { name: "午间补能", share: 41 }, { name: "下午补能", share: 31 }],
        curve: { labels: ["08:00", "10:00", "12:00", "14:00", "17:00", "20:00"], primary: [7.1, 8.8, 10.9, 10.3, 8.5, 7.6], secondary: [6.7, 8.2, 10.1, 9.6, 8.0, 7.1] }
      },
      {
        key: "region",
        label: "区域配送型",
        share: 35,
        basis: "上午和晚间前补能较集中，但总量低于工作日",
        flexibility: "中高",
        avgEnergy: "79 kWh",
        frequency: "3.0 次/日",
        stationPrefs: [{ name: "凤城科技园充电站", share: 39 }, { name: "开发区管委会充电站", share: 34 }, { name: "张家洼莱北充电站", share: 27 }],
        timePrefs: [{ name: "上午补能", share: 36 }, { name: "午间补能", share: 25 }, { name: "晚间补能", share: 39 }],
        curve: { labels: ["07:00", "10:00", "12:00", "15:00", "18:00", "20:00"], primary: [7.3, 9.5, 8.8, 8.1, 10.6, 9.2], secondary: [6.9, 8.9, 8.2, 7.7, 9.8, 8.6] }
      },
      {
        key: "longway",
        label: "跨省长途型",
        share: 28,
        basis: "夜间补能仍然存在，但周末整体占比下降",
        flexibility: "中",
        avgEnergy: "120 kWh",
        frequency: "1.8 次/日",
        stationPrefs: [{ name: "金泰充电站", share: 43 }, { name: "G2京沪高速莱芜服务区", share: 31 }, { name: "凤城科技园充电站", share: 26 }],
        timePrefs: [{ name: "凌晨补能", share: 31 }, { name: "午间补能", share: 19 }, { name: "夜间集中", share: 50 }],
        curve: { labels: ["00:00", "04:00", "08:00", "12:00", "18:00", "22:00"], primary: [9.1, 8.3, 6.4, 5.9, 10.2, 10.9], secondary: [8.5, 7.8, 6.0, 5.5, 9.5, 10.1] }
      }
    ],
    forecastViews: {
      shortRegion: { title: "未来4小时区域负荷预测", labels: ["16:00", "17:00", "18:00", "19:00"], primary: [6.9, 7.4, 8.9, 10.2], secondary: [6.8, 7.1, 8.4, 9.6] },
      shortStation: { title: "重点场站未来24小时预测", labels: hourLabels, primary: [4.9, 4.6, 4.4, 4.2, 4.4, 4.7, 5.0, 5.7, 6.0, 6.4, 6.8, 7.2, 7.7, 7.5, 7.3, 7.0, 6.9, 7.4, 8.9, 10.2, 9.1, 7.8, 6.2, 5.4], secondary: [4.8, 4.5, 4.3, 4.2, 4.3, 4.6, 4.9, 5.4, 5.8, 6.1, 6.5, 6.9, 7.4, 7.3, 7.0, 6.8, 6.7, 7.0, 8.4, 9.6, 8.7, 7.6, 6.0, 5.1] },
      mediumLong: { title: "月度/年度中长期趋势", labels: ["2026-05", "2026-06", "2026-07", "2026-Q3", "2026-Q4", "2027"], primary: [288, 301, 318, 326, 339, 358], secondary: [282, 296, 311, 320, 332, 350] }
    },
    actionViews: {
      strategy: { status: "已生成周末柔性引导策略包，优先将固定型用户引导至午间深谷窗口。", labels: ["09:00", "11:00", "13:00", "15:00", "18:00", "20:00"], primary: [7.0, 8.6, 9.8, 8.7, 9.4, 8.2], secondary: [7.3, 8.0, 8.9, 8.5, 10.1, 9.0] },
      report: { status: "已生成周末运营日报，可用于低活跃日模型回测与异常识别汇报。", labels: ["D-6", "D-5", "D-4", "D-3", "D-2", "D-1", "D0"], primary: [89, 88, 86, 85, 84, 84, 84.1], secondary: [91, 89, 88, 86, 85, 84, 83] },
      alert: { status: "已对金泰充电站异常抬升发布预警，建议核查订单来源与设备状态。", labels: ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"], primary: [35, 42, 40, 46, 69, 57], secondary: [55, 55, 55, 55, 55, 55] }
    },
    strategies: [
      { level: "建议执行", name: "周末柔性引导", action: "引导园区固定型用户优先进入午间深谷充电", gain: "预计平移 4.4 MWh" },
      { level: "运营检查", name: "异常负荷核验", action: "核查金泰充电站临时抬升是否来自集中到站订单", gain: "提升画像准确性" }
    ],
    alerts: [
      { time: "11:05", title: "午间深谷窗口已开启", text: "当前整体负荷平稳，可释放更多预约名额承接柔性订单。" },
      { time: "17:50", title: "金泰充电站出现短时异常抬升", text: "周末背景下负荷增长偏离常态，建议核查订单来源与设备状态。" },
      { time: "19:00", title: "区域峰值低于工作日基线", text: "适合作为模型回测样本，验证低活跃日预测稳定性。" }
    ],
    districtLoads: [
      { energy: 63.4, utilization: 55, note: "莱芜区整体平稳，周末柔性空间较大" },
      { energy: 19.8, utilization: 72, note: "钢城区出现局部异常抬升，需结合订单核查" }
    ]
  })
};

export function getScenario(key) {
  return scenarios[key] || scenarios.spring;
}

export function getStatusTone(utilization) {
  if (utilization >= 85) return "danger";
  if (utilization >= 70) return "warning";
  return "safe";
}

export function getStatusLabel(utilization) {
  if (utilization >= 85) return "红色预警";
  if (utilization >= 70) return "黄色关注";
  return "绿色平稳";
}

export function getMapZoneLabel(utilization) {
  if (utilization >= 85) return "红色受限区";
  if (utilization >= 70) return "黄色预警区";
  return "绿色容量充足区";
}

export function getMapZoneAdvice(utilization) {
  if (utilization >= 85) return "需要增容";
  if (utilization >= 70) return "需群控接入";
  return "容量充足";
}
