<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppShell from "./components/AppShell.vue";
import { modules } from "./data/dashboard";

const route = useRoute();
const currentModule = computed(() => modules.find((item) => item.path === route.path) || modules[0]);
</script>

<template>
  <AppShell :current-module="currentModule">
    <RouterView />
  </AppShell>
</template>
