<script setup>
import { ref } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: ""
  },
  desc: {
    type: String,
    default: ""
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  defaultOpen: {
    type: Boolean,
    default: true
  }
});

const open = ref(props.defaultOpen);
</script>

<template>
  <section class="panel collapsible-panel" :class="{ collapsed: collapsible && !open }">
    <div class="panel-head">
      <div class="collapsible-panel-main">
        <slot name="header">
          <div>
            <h3 class="panel-title">{{ title }}</h3>
            <div class="panel-desc">{{ desc }}</div>
          </div>
        </slot>
      </div>
      <div class="collapsible-panel-actions">
        <slot name="actions" />
        <button
          v-if="collapsible"
          type="button"
          class="section-toggle-btn"
          :aria-expanded="open"
          @click="open = !open"
        >
          {{ open ? "收起" : "展开" }}
        </button>
      </div>
    </div>
    <div v-show="open" class="collapsible-panel-body">
      <slot />
    </div>
  </section>
</template>
