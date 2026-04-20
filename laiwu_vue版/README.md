# 莱芜重卡充电运营分析原型系统

基于以下技术栈搭建的框架版前端原型：

- `Vue 3`
- `Vite`
- `Pinia`
- `Vue Router`
- `Apache ECharts`

## 目录说明

- `src/data/dashboard.js`
  - 原型系统模拟数据、模块定义、地图专题数据
- `src/stores/dashboard.js`
  - 全局场景状态管理
- `src/router/index.js`
  - 页面路由配置
- `src/pages/`
  - 各功能页面
- `src/components/`
  - 公共布局、图表组件、莱芜地图组件
- `src/styles/main.css`
  - 全局样式

## 页面结构

- `/` 总览驾驶舱
- `/governance` 多源数据整合与治理
- `/load-profile` 多维度负荷特征画像构建
- `/user-profile` 重卡用户群体画像与行为预测
- `/flexibility` 调节潜力分析与量化评估
- `/forecast` 充电负荷预测
- `/decision` 充电运营优化与辅助决策数据应用
- `/map-topic` 地图展示专题

## 启动方式

```bash
npm install
npm run dev
```

若需要切换到 Java 后端接口：

```bash
VITE_API_BASE_URL=http://localhost:8080/api npm run dev
```

## 说明

- 当前工作区环境未安装 `node / npm`，因此本次只完成项目骨架与源码搭建，未在本机执行依赖安装与 Vite 启动。
- 项目采用模拟数据驱动，后续可由后端接口和模型结果逐步替换。
- 地图展示专题当前为莱芜区域示意底图，适合原型演示；后续可替换为正式 `GeoJSON` 或接入更精细的空间数据。
- 已预留 Java 后端场景接口与算法网关接口，前端默认无 `VITE_API_BASE_URL` 时回退本地模拟数据。
