<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <section class="metric-grid">
    <div v-for="item in items" :key="item.label" class="metric-card">
      <div class="label">{{ item.label }}</div>
      <div class="value">
        {{ item.value }}<span class="metric-unit">{{ item.unit }}</span>
      </div>
      <div class="muted">{{ item.sub }}</div>
    </div>
  </section>
</template>
