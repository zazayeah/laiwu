<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { modules } from "../data/dashboard";
import { useDashboardStore } from "../stores/dashboard";

const props = defineProps({
  currentModule: {
    type: Object,
    required: true
  }
});

const store = useDashboardStore();
const currentScenario = computed(() => store.scenario);
const sidebarCollapsed = ref(false);

const scenarioOptions = [
  { key: "spring", label: "春秋工作日" },
  { key: "summer", label: "迎峰夏季" },
  { key: "weekend", label: "周末低活跃" }
];

onMounted(() => {
  store.loadScenario();
});
</script>

<template>
  <div class="shell" :class="{ collapsed: sidebarCollapsed }">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button
        type="button"
        class="collapse-btn edge"
        :aria-label="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        {{ sidebarCollapsed ? ">" : "<" }}
      </button>
      <div class="brand">
        <template v-if="!sidebarCollapsed">
          <small>STATE GRID STYLE</small>
          <h1>莱芜重卡充电运营分析平台</h1>
          <p>重卡负荷画像、预测评估、地图专题一体化展示</p>
        </template>
        <template v-else>
          <div class="brand-compact">分析平台</div>
        </template>
      </div>
      <div class="nav-list">
        <RouterLink
          v-for="module in modules"
          :key="module.key"
          :to="module.path"
          class="nav-item"
          :class="{ active: module.path === currentModule.path }"
          :title="module.title"
        >
          <span class="nav-badge">{{ module.title.slice(0, 2) }}</span>
          <strong>{{ module.title }}</strong>
          <span>{{ module.desc }}</span>
        </RouterLink>
      </div>
    </aside>
    <main class="main">
      <section class="topbar">
        <div class="topbar-main">
          <div class="headline">
            <div class="platform-title">莱芜重卡充电运营分析平台</div>
            <h2>{{ currentModule.title }}</h2>
            <div class="headline-subline">{{ currentScenario.title }}</div>
          </div>
          <div class="scenario-box">
            <div class="scenario-row single-line">
              <strong>模拟场景切换</strong>
              <div class="tabs single-line-tabs">
                <button
                  v-for="item in scenarioOptions"
                  :key="item.key"
                  class="tab-btn"
                  :class="{ active: item.key === store.scenarioKey }"
                  @click="store.setScenario(item.key)"
                >
                  {{ item.label }}
                </button>
              </div>
              <span v-if="store.loading" class="tag">数据加载中</span>
            </div>
          </div>
        </div>
      </section>

      <slot />
    </main>
  </div>
</template>
