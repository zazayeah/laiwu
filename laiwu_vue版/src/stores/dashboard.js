import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { getScenario } from "../data/dashboard";
import { fetchScenario } from "../services/dashboardApi";

export const useDashboardStore = defineStore("dashboard", () => {
  const scenarioKey = ref("spring");
  const scenarioData = ref(getScenario("spring"));
  const loading = ref(false);

  const scenario = computed(() => scenarioData.value);

  async function loadScenario(key = scenarioKey.value) {
    loading.value = true;
    try {
      scenarioData.value = await fetchScenario(key);
    } finally {
      loading.value = false;
    }
  }

  async function setScenario(key) {
    scenarioKey.value = key;
    await loadScenario(key);
  }

  return {
    scenarioKey,
    scenario,
    loading,
    setScenario,
    loadScenario
  };
});
