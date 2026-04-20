<script setup>
import { computed, ref, watch } from "vue";
import CollapsiblePanel from "../components/CollapsiblePanel.vue";
import LineChartCard from "../components/LineChartCard.vue";
import { useDashboardStore } from "../stores/dashboard";

const store = useDashboardStore();
const sourceIndex = ref(0);
const scenario = computed(() => store.scenario);
const sources = computed(() => scenario.value.governanceSources);
const currentSource = computed(() => sources.value[sourceIndex.value] || sources.value[0]);

watch(
  () => store.scenarioKey,
  () => {
    sourceIndex.value = 0;
  }
);
</script>

<template>
  <section class="panel section">
    <div class="panel-head">
      <div>
        <h3 class="panel-title">数据源治理工作台</h3>
        <div class="panel-desc">切换不同数据源，查看其治理质量、时效性和标准服务输出。</div>
      </div>
      <div class="tabs">
        <button
          v-for="(item, index) in sources"
          :key="item.key"
          class="tab-btn"
          :class="{ active: index === sourceIndex }"
          @click="sourceIndex = index"
        >
          {{ item.name }}
        </button>
      </div>
    </div>
    <div class="card-grid">
      <div class="stat-card">
        <div class="label">当前数据源</div>
        <div class="value" style="font-size:26px;">{{ currentSource.name }}</div>
        <div class="muted">治理规则：{{ currentSource.rules }}</div>
      </div>
      <div class="stat-card">
        <div class="label">数据时效</div>
        <div class="value">{{ currentSource.freshness }}</div>
        <div class="muted">满足分钟级或批次级更新要求</div>
      </div>
      <div class="stat-card">
        <div class="label">质量通过率</div>
        <div class="value">{{ currentSource.quality }}</div>
        <div class="muted">治理后向专题分析提供稳定数据输入</div>
      </div>
    </div>
  </section>

  <LineChartCard
    :title="`${currentSource.name} 治理趋势`"
    desc="主线展示质量通过率，副线展示异常记录数量。"
    :labels="currentSource.trend.labels"
    :primary="currentSource.trend.primary"
    :secondary="currentSource.trend.secondary"
    primary-name="质量通过率"
    secondary-name="异常记录数"
    collapsible
  />

  <CollapsiblePanel
    class="section"
    title="治理规则与主题数据组织"
    desc="合并展示治理规则、标准输出和主题数据组织方式。"
  >
    <section class="dual-grid" style="margin-top:0;">
      <div>
        <div class="label" style="margin-bottom:12px;">治理规则与标准输出</div>
        <div class="list">
          <div class="info-card">
            <div class="label">治理规则</div>
            <strong>{{ currentSource.rules }}</strong>
            <p class="muted">用于解决缺失、异常、映射、对齐和标准口径一致性问题。</p>
          </div>
          <div class="info-card">
            <div class="label">标准输出</div>
            <strong>{{ currentSource.output }}</strong>
            <p class="muted">治理后的标准结果将供画像、预测、调节和决策页面复用。</p>
          </div>
        </div>
      </div>

      <div>
        <div class="label" style="margin-bottom:12px;">主题数据组织</div>
        <div class="notes">
          <div class="list-row"><strong>站点主题</strong><span class="muted">站点、设备、区域、容量、状态</span><span>系统开发</span></div>
          <div class="list-row"><strong>订单主题</strong><span class="muted">订单、时长、电量、车次、时段标签</span><span>系统开发</span></div>
          <div class="list-row"><strong>画像主题</strong><span class="muted">负荷画像、用户画像、策略标签</span><span>系统开发</span></div>
        </div>
      </div>
    </section>
  </CollapsiblePanel>
</template>
