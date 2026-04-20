import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./styles/main.css";

const app = createApp(App);

function renderFatalError(title, detail) {
  const root = document.querySelector("#app");
  if (!root) return;
  root.innerHTML = `
    <div style="min-height:100vh;padding:32px;background:#0e171b;color:#edf3f5;font-family:'Avenir Next','PingFang SC','Microsoft YaHei',sans-serif;">
      <div style="max-width:960px;margin:0 auto;padding:24px;border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#142026;">
        <div style="font-size:14px;color:#ffbd59;margin-bottom:10px;">Prototype Runtime Error</div>
        <h1 style="margin:0 0 14px;font-size:28px;">${title}</h1>
        <pre style="white-space:pre-wrap;word-break:break-word;line-height:1.7;font-size:13px;color:#c8d4d8;">${detail}</pre>
      </div>
    </div>
  `;
}

app.config.errorHandler = (error, instance, info) => {
  console.error("[Vue Error]", info, error, instance);
  renderFatalError("Vue 页面运行失败", `${info}\n\n${error?.stack || error?.message || String(error)}`);
};

window.addEventListener("error", (event) => {
  console.error("[Window Error]", event.error || event.message);
  renderFatalError("前端脚本运行失败", event.error?.stack || event.message || "Unknown error");
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("[Promise Rejection]", event.reason);
  const detail =
    event.reason?.stack || event.reason?.message || JSON.stringify(event.reason, null, 2) || "Unknown promise rejection";
  renderFatalError("异步请求失败", detail);
});

app.use(createPinia());
app.use(router);
app.mount("#app");
