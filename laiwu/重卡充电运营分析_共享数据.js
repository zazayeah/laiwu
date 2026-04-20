(function () {
  const STORAGE_KEY = "heavy_truck_dashboard_scenario";

  const pageLinks = [
    { file: "重卡充电运营分析原型.html", no: "00", label: "总览页" },
    { file: "重卡充电运营分析_01数据整合治理.html", no: "01", label: "数据整合治理" },
    { file: "重卡充电运营分析_02负荷画像分析.html", no: "02", label: "负荷画像分析" },
    { file: "重卡充电运营分析_03用户画像预测.html", no: "03", label: "用户画像预测" },
    { file: "重卡充电运营分析_04调节潜力评估.html", no: "04", label: "调节潜力评估" },
    { file: "重卡充电运营分析_05多尺度预测.html", no: "05", label: "多尺度预测" },
    { file: "重卡充电运营分析_06辅助决策应用.html", no: "06", label: "辅助决策应用" }
  ];

  const scenarios = {
    spring: {
      title: "春秋工作日场景",
      note: "模拟日期：2026-04-08 | 深谷窗口 11:00-14:00 | 适合展示午间新能源友好消纳",
      meta: [
        { label: "当前模式", value: "春秋谷段", desc: "午间存在深谷信号" },
        { label: "重点区域", value: "莱芜城区", desc: "3个站点高活跃" },
        { label: "数据状态", value: "模拟数据", desc: "用于原型汇报展示" }
      ],
      kpis: [
        { label: "当日总充电量", value: "118.4", unit: "MWh", badge: "较昨日 +8.7%", sub: "订单 1,286 笔，区域配送型贡献最高" },
        { label: "预测峰值负荷", value: "14.8", unit: "MW", badge: "19:30", sub: "晚高峰前需关注部分站点并发抬升" },
        { label: "可平移电量", value: "28.6", unit: "MWh", badge: "深谷引导", sub: "午间可引导增充，削减晚高峰挤兑" },
        { label: "预估单日节省", value: "0.93", unit: "万元", badge: "模拟测算", sub: "基于分时购电价差与策略平移收益" }
      ],
      score: 82,
      scoreSignals: [
        { title: "深谷增充机会明显", text: "11:00-14:00 模拟深谷窗口，建议释放可延后订单和低时效补能任务。" },
        { title: "晚高峰需预调", text: "18:00 后区域负荷回升，建议提前完成高弹性车辆补能。" }
      ],
      prices: [
        { band: "深谷", rate: "0.28 元/kWh", window: "11:00-14:00", deep: true },
        { band: "低谷", rate: "0.39 元/kWh", window: "10:00-11:00 / 14:00-15:00" },
        { band: "平段", rate: "0.63 元/kWh", window: "其余平稳时段" },
        { band: "高峰/尖峰", rate: "1.06 / 1.18 元/kWh", window: "18:00-22:00 重点关注" }
      ],
      priceBands: [
        { start: 0, end: 7, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 7, end: 10, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 10, end: 11, color: "rgba(104, 214, 201, 0.08)", label: "谷" },
        { start: 11, end: 14, color: "rgba(185, 231, 105, 0.12)", label: "深谷" },
        { start: 14, end: 18, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 18, end: 20, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 20, end: 22, color: "rgba(255, 100, 100, 0.1)", label: "尖峰" },
        { start: 22, end: 24, color: "rgba(104, 214, 201, 0.08)", label: "谷" }
      ],
      actualLoad: [6.2, 5.8, 5.5, 5.3, 5.6, 6.1, 6.8, 7.9, 8.6, 9.4, 10.8, 11.6, 12.1, 11.8, 11.2, 10.7, 10.1, 11.0, 12.6, 13.8, 13.1, 11.9, 9.8, 7.5],
      forecastLoad: [6.1, 5.9, 5.5, 5.4, 5.7, 6.2, 6.9, 8.1, 8.8, 9.8, 10.5, 11.4, 12.5, 12.2, 11.5, 10.9, 10.6, 11.7, 13.4, 14.8, 14.1, 12.4, 10.2, 7.9],
      chartNotes: [
        { title: "午间消纳窗口", text: "11:00-14:00 模拟深谷，建议将非刚性补能任务向午间平移。" },
        { title: "晚高峰保护", text: "19:00 前后为预测峰值时段，可通过提前补能和平移订单缓释峰值。" },
        { title: "预测输入", text: "分时电价、天气、日期类型、近期订单行为和站点容量共同参与建模。" }
      ],
      stations: [
        { name: "凤城物流园站", status: "建议增充", tone: "good", load: "4.2 MW", use: "78%", shift: "8.1 MWh", progress: 78 },
        { name: "钢城南枢纽站", status: "重点观察", tone: "watch", load: "3.7 MW", use: "86%", shift: "5.4 MWh", progress: 86 },
        { name: "口镇综合能源站", status: "可平移强", tone: "good", load: "2.9 MW", use: "64%", shift: "7.8 MWh", progress: 64 },
        { name: "高新区货运站", status: "晚峰预警", tone: "alert", load: "4.8 MW", use: "91%", shift: "3.2 MWh", progress: 91 }
      ],
      segments: [
        { label: "区域配送型", value: 41, color: "#b9e769" },
        { label: "跨省长途型", value: 34, color: "#68d6c9" },
        { label: "园区固定型", value: 25, color: "#ffbd59" }
      ],
      strategies: [
        { name: "午间深谷增充", level: "优先执行", trigger: "11:00-14:00", action: "释放可延后订单并提升可用功率至 92%", gain: "预计增充 6.8 MWh" },
        { name: "晚高峰预降载", level: "滚动跟踪", trigger: "18:30-20:30", action: "对高新区货运站启用分批排队与柔性功率控制", gain: "峰值降低约 1.2 MW" }
      ],
      alerts: [
        { time: "10:40", title: "午间深谷窗口即将开启", text: "建议将 2 个可延迟订单调整至 11:00 后开始补能。", color: "#b9e769" },
        { time: "14:25", title: "钢城南枢纽站利用率接近上限", text: "设备利用率预计 30 分钟内超过 88%，建议分流至口镇综合能源站。", color: "#ffbd59" },
        { time: "18:50", title: "高新区货运站晚高峰抬升", text: "预测并发负荷将突破 4.9 MW，建议提前下发功率控制策略。", color: "#ff6464" }
      ],
      governance: {
        realtime: { name: "实时充电流", freshness: "15 秒", quality: "98.6%", output: "站点分钟级负荷服务", rules: "设备状态、功率连续性、站点编码映射" },
        history: { name: "历史订单", freshness: "T+1", quality: "97.9%", output: "订单行为主题宽表", rules: "订单闭环、时长异常、充电量异常" },
        weather: { name: "天气与日期", freshness: "30 分钟", quality: "99.1%", output: "外部因子特征服务", rules: "时间对齐、节假日映射、温度缺测补齐" },
        price: { name: "分时电价信号", freshness: "日级", quality: "100%", output: "价格信号特征表", rules: "月份分段、峰谷映射、时段切片" }
      },
      monthlyTrend: [
        { time: "2026-04", value: "372 MWh/日", hint: "春秋深谷引导", conf: "中" },
        { time: "2026-05", value: "388 MWh/日", hint: "物流活跃度提升", conf: "中高" },
        { time: "2026-06", value: "401 MWh/日", hint: "高温影响开始显现", conf: "高" }
      ]
    },
    summer: {
      title: "迎峰夏季场景",
      note: "模拟日期：2026-07-15 | 夜间低谷更明显 | 午间以高温影响和站点冷却约束为主",
      meta: [
        { label: "当前模式", value: "夏季高温", desc: "夜间低谷更突出" },
        { label: "重点区域", value: "莱芜南部", desc: "长途站点占比提升" },
        { label: "数据状态", value: "模拟数据", desc: "展示季节切换效果" }
      ],
      kpis: [
        { label: "当日总充电量", value: "132.6", unit: "MWh", badge: "较昨日 +5.2%", sub: "跨省长途型订单占比上升" },
        { label: "预测峰值负荷", value: "16.4", unit: "MW", badge: "21:10", sub: "夜间补能集中，需控制队列拥挤" },
        { label: "可平移电量", value: "24.3", unit: "MWh", badge: "夜谷引导", sub: "建议向 01:00-06:00 进一步平移" },
        { label: "预估单日节省", value: "0.88", unit: "万元", badge: "模拟测算", sub: "夜间谷段策略收益更稳定" }
      ],
      score: 68,
      scoreSignals: [
        { title: "夜间谷段主导", text: "夏季无午间深谷，建议将更多柔性订单向夜间低谷聚集。" },
        { title: "高温对站点约束增强", text: "白天站点设备热负荷上升，宜控制连续满功率运行时长。" }
      ],
      prices: [
        { band: "低谷", rate: "0.35 元/kWh", window: "01:00-06:00", deep: true },
        { band: "平段", rate: "0.67 元/kWh", window: "白天大部分时段" },
        { band: "高峰", rate: "1.03 元/kWh", window: "10:00-12:00 / 17:00-19:00" },
        { band: "尖峰", rate: "1.21 元/kWh", window: "20:00-22:00" }
      ],
      priceBands: [
        { start: 0, end: 1, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 1, end: 6, color: "rgba(185, 231, 105, 0.12)", label: "谷" },
        { start: 6, end: 10, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 10, end: 12, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 12, end: 17, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 17, end: 19, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 19, end: 20, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 20, end: 22, color: "rgba(255, 100, 100, 0.1)", label: "尖峰" },
        { start: 22, end: 24, color: "rgba(127, 217, 255, 0.06)", label: "平" }
      ],
      actualLoad: [8.3, 7.6, 7.1, 6.8, 7.0, 7.9, 9.2, 10.8, 11.6, 12.1, 12.8, 13.0, 12.3, 11.9, 11.5, 11.8, 12.4, 13.1, 14.5, 15.7, 16.1, 15.3, 13.4, 10.2],
      forecastLoad: [8.1, 7.4, 7.0, 6.6, 6.9, 7.8, 9.0, 10.5, 11.3, 11.9, 12.6, 12.9, 12.5, 12.0, 11.8, 12.2, 12.8, 13.6, 15.0, 15.9, 16.4, 15.8, 13.7, 10.9],
      chartNotes: [
        { title: "夜谷引导更关键", text: "夏季缺少午间深谷，柔性订单更适合向凌晨谷段集中。" },
        { title: "高温负荷叠加", text: "日间环境温度和设备热负荷上升，建议控制站点连续高功率运行。" },
        { title: "调控重点", text: "优先控制 20:00-22:00 尖峰压力，并在 01:00-06:00 提前消化长途车辆需求。" }
      ],
      stations: [
        { name: "凤城物流园站", status: "夜谷优先", tone: "good", load: "4.8 MW", use: "82%", shift: "6.2 MWh", progress: 82 },
        { name: "钢城南枢纽站", status: "持续高载", tone: "alert", load: "5.1 MW", use: "93%", shift: "2.6 MWh", progress: 93 },
        { name: "口镇综合能源站", status: "可承接分流", tone: "good", load: "3.2 MW", use: "58%", shift: "5.9 MWh", progress: 58 },
        { name: "高新区货运站", status: "峰段观察", tone: "watch", load: "4.3 MW", use: "88%", shift: "4.1 MWh", progress: 88 }
      ],
      segments: [
        { label: "跨省长途型", value: 43, color: "#68d6c9" },
        { label: "区域配送型", value: 33, color: "#b9e769" },
        { label: "园区固定型", value: 24, color: "#ffbd59" }
      ],
      strategies: [
        { name: "夜谷集中补能", level: "优先执行", trigger: "01:00-06:00", action: "对高弹性订单预约夜间窗口并释放排队容量", gain: "预计转移 5.9 MWh" },
        { name: "尖峰时段降功率", level: "重点控制", trigger: "20:00-22:00", action: "对持续驻留车辆实施分档限功率充电", gain: "尖峰压降约 1.5 MW" }
      ],
      alerts: [
        { time: "09:20", title: "钢城南枢纽站设备温升偏高", text: "高温天气下连续大功率运行超阈值，建议降低单枪并发。", color: "#ff6464" },
        { time: "15:10", title: "长途型用户预约夜间补能意愿上升", text: "可提前释放 01:00-03:00 预约名额，提高谷段承接能力。", color: "#68d6c9" },
        { time: "20:18", title: "尖峰价格窗口已启动", text: "建议对低时效车辆启用分档降功率策略，控制购电成本。", color: "#ffbd59" }
      ],
      governance: {
        realtime: { name: "实时充电流", freshness: "10 秒", quality: "97.8%", output: "站点分钟级负荷服务", rules: "设备温升联动、功率连续性、站点编码映射" },
        history: { name: "历史订单", freshness: "T+1", quality: "97.4%", output: "订单行为主题宽表", rules: "长途订单识别、时长异常、充电量异常" },
        weather: { name: "天气与日期", freshness: "15 分钟", quality: "98.7%", output: "高温特征因子服务", rules: "时间对齐、气温分层、极端天气标注" },
        price: { name: "分时电价信号", freshness: "日级", quality: "100%", output: "价格信号特征表", rules: "夏季时段、夜谷标签、尖峰窗口识别" }
      },
      monthlyTrend: [
        { time: "2026-07", value: "416 MWh/日", hint: "夜谷补能提升", conf: "高" },
        { time: "2026-08", value: "423 MWh/日", hint: "高温与长途需求叠加", conf: "高" },
        { time: "2026-09", value: "395 MWh/日", hint: "季节切换，午间窗口回归", conf: "中高" }
      ]
    },
    weekend: {
      title: "周末低活跃场景",
      note: "模拟日期：2026-05-17 | 活跃度下降 | 更适合观察基础画像、异常识别和低负荷策略",
      meta: [
        { label: "当前模式", value: "周末低活跃", desc: "整体负荷较平稳" },
        { label: "重点区域", value: "园区场景", desc: "固定型用户占比提升" },
        { label: "数据状态", value: "模拟数据", desc: "演示低负荷日展示风格" }
      ],
      kpis: [
        { label: "当日总充电量", value: "84.1", unit: "MWh", badge: "较昨日 -14.9%", sub: "区域配送需求回落，园区型用户更稳定" },
        { label: "预测峰值负荷", value: "10.2", unit: "MW", badge: "18:40", sub: "整体波动缓和，适合做异常识别" },
        { label: "可平移电量", value: "19.7", unit: "MWh", badge: "空间宽松", sub: "周末具备更强的柔性引导条件" },
        { label: "预估单日节省", value: "0.57", unit: "万元", badge: "模拟测算", sub: "收益下降但负荷调控更从容" }
      ],
      score: 76,
      scoreSignals: [
        { title: "负荷整体平稳", text: "适合验证画像标签、异常识别和站点容量冗余判断。" },
        { title: "园区固定型占比上升", text: "可试行更稳定的预约分流和慢充策略。" }
      ],
      prices: [
        { band: "深谷", rate: "0.29 元/kWh", window: "11:00-14:00", deep: true },
        { band: "低谷", rate: "0.41 元/kWh", window: "10:00-11:00 / 14:00-15:00" },
        { band: "平段", rate: "0.60 元/kWh", window: "其余大部分时段" },
        { band: "高峰", rate: "0.95 元/kWh", window: "18:00-20:00" }
      ],
      priceBands: [
        { start: 0, end: 8, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 8, end: 10, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 10, end: 11, color: "rgba(104, 214, 201, 0.08)", label: "谷" },
        { start: 11, end: 14, color: "rgba(185, 231, 105, 0.12)", label: "深谷" },
        { start: 14, end: 18, color: "rgba(127, 217, 255, 0.06)", label: "平" },
        { start: 18, end: 20, color: "rgba(255, 189, 89, 0.08)", label: "高" },
        { start: 20, end: 24, color: "rgba(127, 217, 255, 0.06)", label: "平" }
      ],
      actualLoad: [4.8, 4.5, 4.4, 4.3, 4.4, 4.8, 5.1, 5.8, 6.2, 6.6, 7.0, 7.4, 7.8, 7.6, 7.2, 6.9, 6.8, 7.1, 8.4, 9.6, 8.7, 7.6, 6.0, 5.1],
      forecastLoad: [4.9, 4.6, 4.4, 4.2, 4.4, 4.7, 5.0, 5.7, 6.0, 6.4, 6.8, 7.2, 7.7, 7.5, 7.3, 7.0, 6.9, 7.4, 8.9, 10.2, 9.1, 7.8, 6.2, 5.4],
      chartNotes: [
        { title: "低活跃日适配", text: "更适合展示画像标签稳定性和站点容量冗余分析。" },
        { title: "柔性空间更宽", text: "周末时效约束减弱，可尝试更积极的错峰引导策略。" },
        { title: "异常识别价值", text: "在整体平稳背景下，个别站点异常抬升更容易被发现和预警。" }
      ],
      stations: [
        { name: "凤城物流园站", status: "平稳运行", tone: "good", load: "2.8 MW", use: "56%", shift: "4.9 MWh", progress: 56 },
        { name: "钢城南枢纽站", status: "异常观察", tone: "watch", load: "3.5 MW", use: "72%", shift: "4.2 MWh", progress: 72 },
        { name: "口镇综合能源站", status: "柔性空间大", tone: "good", load: "2.1 MW", use: "43%", shift: "6.6 MWh", progress: 43 },
        { name: "高新区货运站", status: "平稳偏高", tone: "watch", load: "3.7 MW", use: "74%", shift: "4.0 MWh", progress: 74 }
      ],
      segments: [
        { label: "园区固定型", value: 37, color: "#ffbd59" },
        { label: "区域配送型", value: 35, color: "#b9e769" },
        { label: "跨省长途型", value: 28, color: "#68d6c9" }
      ],
      strategies: [
        { name: "周末柔性引导", level: "建议执行", trigger: "11:00-14:00", action: "引导园区固定型用户优先进入午间深谷充电", gain: "预计平移 4.4 MWh" },
        { name: "异常负荷核验", level: "运营检查", trigger: "17:30-19:00", action: "核查钢城南枢纽站临时抬升是否来自集中到站订单", gain: "提升画像准确性" }
      ],
      alerts: [
        { time: "11:05", title: "午间深谷窗口已开启", text: "当前整体负荷平稳，可释放更多预约名额承接柔性订单。", color: "#b9e769" },
        { time: "17:50", title: "钢城南枢纽站出现短时异常抬升", text: "周末背景下负荷增长偏离常态，建议核查订单来源与设备状态。", color: "#ffbd59" },
        { time: "19:00", title: "区域峰值低于工作日基线", text: "适合作为模型回测样本，验证低活跃日预测稳定性。", color: "#68d6c9" }
      ],
      governance: {
        realtime: { name: "实时充电流", freshness: "20 秒", quality: "98.9%", output: "站点分钟级负荷服务", rules: "设备状态、功率连续性、低活跃异常检测" },
        history: { name: "历史订单", freshness: "T+1", quality: "98.2%", output: "订单行为主题宽表", rules: "周末订单标签、时长异常、充电量异常" },
        weather: { name: "天气与日期", freshness: "30 分钟", quality: "99.3%", output: "周末外部因子服务", rules: "时间对齐、周末标签、温度缺测补齐" },
        price: { name: "分时电价信号", freshness: "日级", quality: "100%", output: "价格信号特征表", rules: "月份分段、周末标签、峰谷映射" }
      },
      monthlyTrend: [
        { time: "2026-05", value: "288 MWh/日", hint: "周末平滑负荷", conf: "中高" },
        { time: "2026-06", value: "301 MWh/日", hint: "气温上升影响活跃度", conf: "中" },
        { time: "2026-07", value: "318 MWh/日", hint: "暑期周末物流需求回升", conf: "中高" }
      ]
    }
  };

  const segmentInsights = {
    "区域配送型": {
      avgEnergy: "86 kWh",
      freq: "3.4 次/日",
      flexibility: "中高",
      stationPrefs: [
        { name: "凤城物流园站", share: 41 },
        { name: "高新区货运站", share: 32 },
        { name: "口镇综合能源站", share: 27 }
      ],
      timePrefs: [
        { name: "上午补能", share: 34 },
        { name: "午间补能", share: 29 },
        { name: "晚高峰前", share: 37 }
      ]
    },
    "跨省长途型": {
      avgEnergy: "132 kWh",
      freq: "2.1 次/日",
      flexibility: "中",
      stationPrefs: [
        { name: "钢城南枢纽站", share: 45 },
        { name: "凤城物流园站", share: 33 },
        { name: "高新区货运站", share: 22 }
      ],
      timePrefs: [
        { name: "凌晨补能", share: 28 },
        { name: "午间补能", share: 16 },
        { name: "夜间集中", share: 56 }
      ]
    },
    "园区固定型": {
      avgEnergy: "74 kWh",
      freq: "4.2 次/日",
      flexibility: "高",
      stationPrefs: [
        { name: "口镇综合能源站", share: 46 },
        { name: "凤城物流园站", share: 31 },
        { name: "高新区货运站", share: 23 }
      ],
      timePrefs: [
        { name: "上午补能", share: 26 },
        { name: "午间补能", share: 43 },
        { name: "晚间补能", share: 31 }
      ]
    }
  };

  function numericValue(value) {
    return parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  }

  function avgSlice(list, start, end) {
    const values = list.slice(start, end);
    return values.reduce((sum, item) => sum + item, 0) / values.length;
  }

  function getScenarioKey() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && scenarios[stored] ? stored : "spring";
  }

  function setScenarioKey(key) {
    if (scenarios[key]) {
      localStorage.setItem(STORAGE_KEY, key);
    }
  }

  function getScenario(key) {
    return scenarios[key || getScenarioKey()] || scenarios.spring;
  }

  function renderScenarioSwitch(container, callback) {
    const current = getScenarioKey();
    container.innerHTML = `
      <button class="scenario-btn ${current === "spring" ? "active" : ""}" data-scenario="spring">春秋工作日</button>
      <button class="scenario-btn ${current === "summer" ? "active" : ""}" data-scenario="summer">迎峰夏季</button>
      <button class="scenario-btn ${current === "weekend" ? "active" : ""}" data-scenario="weekend">周末低活跃</button>
    `;

    container.querySelectorAll("[data-scenario]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.scenario;
        setScenarioKey(key);
        renderScenarioSwitch(container, callback);
        callback(key);
      });
    });
  }

  function renderPageLinks(container, currentFile) {
    container.innerHTML = pageLinks.map((item) => `
      <a class="nav-link ${item.file === currentFile ? "active" : ""}" href="${item.file}">
        <em>${item.no}</em>${item.label}
      </a>
    `).join("");
  }

  function renderMeta(container, scenario) {
    container.innerHTML = scenario.meta.map((item) => `
      <div class="mini-meta">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}</div>
        <div class="desc">${item.desc}</div>
      </div>
    `).join("");
  }

  function renderKpis(container, scenario) {
    container.innerHTML = scenario.kpis.map((item) => `
      <div class="metric-card">
        <div class="label">${item.label}</div>
        <div class="value">${item.value}<span style="font-size:15px;font-weight:600;margin-left:8px;">${item.unit}</span></div>
        <div class="sub"><span class="badge">${item.badge}</span><span>${item.sub}</span></div>
      </div>
    `).join("");
  }

  function renderLoadChart(svg, scenario) {
    const width = 920;
    const height = 360;
    const padding = { top: 18, right: 18, bottom: 44, left: 48 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const yMax = Math.max(...scenario.actualLoad, ...scenario.forecastLoad) * 1.18;
    const xStep = innerWidth / (scenario.forecastLoad.length - 1);

    const x = (index) => padding.left + index * xStep;
    const y = (value) => padding.top + innerHeight - (value / yMax) * innerHeight;
    const makePath = (arr) => arr.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`).join(" ");
    const actualPath = makePath(scenario.actualLoad);
    const forecastPath = makePath(scenario.forecastLoad);
    const forecastArea = `${forecastPath} L ${x(scenario.forecastLoad.length - 1).toFixed(2)} ${padding.top + innerHeight} L ${x(0).toFixed(2)} ${padding.top + innerHeight} Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((step) => {
      const value = yMax * step;
      const lineY = y(value);
      return `
        <line x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4 8" />
        <text x="${padding.left - 12}" y="${lineY + 5}" text-anchor="end" fill="rgba(237,244,239,0.55)" font-size="11">${value.toFixed(1)}</text>
      `;
    }).join("");

    const xLabels = scenario.forecastLoad.map((_, index) => {
      if (index % 3 !== 0 && index !== scenario.forecastLoad.length - 1) {
        return "";
      }
      return `<text x="${x(index)}" y="${height - 14}" text-anchor="middle" fill="rgba(237,244,239,0.55)" font-size="11">${String(index).padStart(2, "0")}:00</text>`;
    }).join("");

    const bandRects = scenario.priceBands.map((band) => {
      const x1 = padding.left + (band.start / 23) * innerWidth;
      const x2 = padding.left + (band.end / 23) * innerWidth;
      return `
        <rect x="${x1}" y="${padding.top}" width="${x2 - x1}" height="${innerHeight}" fill="${band.color}" />
        <text x="${(x1 + x2) / 2}" y="${padding.top + 16}" text-anchor="middle" fill="rgba(237,244,239,0.58)" font-size="11">${band.label}</text>
      `;
    }).join("");

    svg.innerHTML = `
      <defs>
        <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(185,231,105,0.28)" />
          <stop offset="100%" stop-color="rgba(185,231,105,0.02)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="20" fill="rgba(255,255,255,0.01)"></rect>
      ${bandRects}
      ${gridLines}
      <path d="${forecastArea}" fill="url(#forecastFill)"></path>
      <path d="${forecastPath}" fill="none" stroke="#b9e769" stroke-width="3" stroke-dasharray="7 7" filter="url(#glow)"></path>
      <path d="${actualPath}" fill="none" stroke="#68d6c9" stroke-width="3.5" filter="url(#glow)"></path>
      ${xLabels}
    `;
  }

  function renderDualLineChart(svg, chart) {
    const width = 920;
    const height = 360;
    const padding = { top: 24, right: 20, bottom: 52, left: 48 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const secondary = chart.secondary && chart.secondary.length ? chart.secondary : null;
    const yMax = Math.max(...chart.primary, ...(secondary || [])) * 1.18;
    const count = chart.labels.length;
    const xStep = count > 1 ? innerWidth / (count - 1) : innerWidth;
    const x = (index) => padding.left + index * xStep;
    const y = (value) => padding.top + innerHeight - (value / yMax) * innerHeight;
    const pathFor = (arr) => arr.map((value, index) => `${index === 0 ? "M" : "L"} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`).join(" ");

    const primaryPath = pathFor(chart.primary);
    const primaryArea = `${primaryPath} L ${x(count - 1).toFixed(2)} ${padding.top + innerHeight} L ${x(0).toFixed(2)} ${padding.top + innerHeight} Z`;
    const secondaryPath = secondary ? pathFor(secondary) : "";

    const grid = [0, 0.25, 0.5, 0.75, 1].map((step) => {
      const value = yMax * step;
      const lineY = y(value);
      return `
        <line x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4 8"></line>
        <text x="${padding.left - 12}" y="${lineY + 5}" text-anchor="end" fill="rgba(237,244,239,0.55)" font-size="11">${value.toFixed(1)}</text>
      `;
    }).join("");

    const labels = chart.labels.map((label, index) => {
      const shouldShow = count <= 6 || index % Math.ceil(count / 6) === 0 || index === count - 1;
      if (!shouldShow) return "";
      return `<text x="${x(index)}" y="${height - 16}" text-anchor="middle" fill="rgba(237,244,239,0.55)" font-size="11">${label}</text>`;
    }).join("");

    const primaryDots = chart.primary.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="3.4" fill="${chart.primaryColor || "#b9e769"}"></circle>`).join("");
    const secondaryDots = secondary ? secondary.map((value, index) => `<circle cx="${x(index)}" cy="${y(value)}" r="2.8" fill="${chart.secondaryColor || "#68d6c9"}"></circle>`).join("") : "";

    svg.innerHTML = `
      <defs>
        <linearGradient id="sharedAreaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(185,231,105,0.24)"></stop>
          <stop offset="100%" stop-color="rgba(185,231,105,0.02)"></stop>
        </linearGradient>
        <filter id="sharedGlow">
          <feGaussianBlur stdDeviation="5" result="blur"></feGaussianBlur>
          <feMerge>
            <feMergeNode in="blur"></feMergeNode>
            <feMergeNode in="SourceGraphic"></feMergeNode>
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="${width}" height="${height}" rx="20" fill="rgba(255,255,255,0.01)"></rect>
      ${grid}
      <path d="${primaryArea}" fill="url(#sharedAreaFill)"></path>
      ${secondary ? `<path d="${secondaryPath}" fill="none" stroke="${chart.secondaryColor || "#68d6c9"}" stroke-width="2.6" stroke-dasharray="5 6"></path>` : ""}
      <path d="${primaryPath}" fill="none" stroke="${chart.primaryColor || "#b9e769"}" stroke-width="3.4" filter="url(#sharedGlow)"></path>
      ${primaryDots}
      ${secondaryDots}
      ${labels}
    `;
  }

  window.HeavyTruckDashboard = {
    pageLinks,
    scenarios,
    segmentInsights,
    numericValue,
    avgSlice,
    getScenarioKey,
    setScenarioKey,
    getScenario,
    renderScenarioSwitch,
    renderPageLinks,
    renderMeta,
    renderKpis,
    renderLoadChart,
    renderDualLineChart
  };
})();
