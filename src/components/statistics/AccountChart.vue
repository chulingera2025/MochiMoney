<template>
  <div class="account-chart">
    <div class="chart-header">
      <span class="chart-title">账户分布</span>
    </div>
    
    <div class="chart-content">
      <div v-if="!data || data.length === 0" class="no-data">
        暂无数据
      </div>
      
      <div v-else class="chart-container">
        <!-- 柱状图 -->
        <div class="bar-chart">
          <div class="chart-grid">
            <div class="y-axis">
              <div class="y-label" v-for="label in yLabels" :key="label">
                {{ formatAmount(label) }}
              </div>
            </div>
            
            <div class="chart-area">
              <div class="bars-container">
                <div
                  v-for="(item, index) in data"
                  :key="item.accountId"
                  class="bar-item"
                  @click="handleBarClick(item)"
                >
                  <div class="bar-wrapper">
                    <div
                      class="bar"
                      :style="{
                        height: `${getBarHeight(item.balance)}%`,
                        backgroundColor: item.accountColor
                      }"
                    >
                      <div class="bar-amount">{{ formatAmount(item.balance) }}</div>
                    </div>
                  </div>
                  <div class="bar-label">{{ item.accountName }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 账户详情列表 -->
        <div class="account-list">
          <div
            v-for="(item, index) in data"
            :key="item.accountId"
            class="account-item"
            @click="handleAccountClick(item)"
          >
            <div class="account-icon">
              <van-icon :name="item.accountIcon" />
            </div>
            <div class="account-info">
              <div class="account-name">{{ item.accountName }}</div>
              <div class="account-balance" :class="{ negative: item.balance < 0 }">
                {{ formatAmount(item.balance) }}
              </div>
            </div>
            <div class="account-percentage">
              {{ item.percentage.toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatAmount } from '@/utils/number'
import type { AccountData } from '@/types/statistics'

interface Props {
  data: AccountData[]
}

const props = defineProps<Props>()

// 计算Y轴标签
const yLabels = computed(() => {
  if (!props.data || props.data.length === 0) return [0]
  
  const maxBalance = Math.max(...props.data.map(d => Math.abs(d.balance)))
  const step = Math.ceil(maxBalance / 4)
  return [0, step, step * 2, step * 3, step * 4]
})

// 获取最大值
const maxValue = computed(() => {
  const max = Math.max(...yLabels.value)
  return max || 100
})

// 计算柱状图高度百分比
const getBarHeight = (balance: number): number => {
  const absBalance = Math.abs(balance)
  return (absBalance / maxValue.value) * 100
}

// 处理柱状图点击
const handleBarClick = (item: AccountData) => {
  console.log('点击柱状图:', item)
}

// 处理账户点击
const handleAccountClick = (item: AccountData) => {
  console.log('点击账户:', item)
}
</script>

<style scoped>
.account-chart {
  padding: var(--space-md);
}

.chart-header {
  margin-bottom: var(--space-md);
}

.chart-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-content {
  min-height: 300px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.chart-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.bar-chart {
  
}

.chart-grid {
  display: flex;
  align-items: stretch;
}

.y-axis {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  width: 60px;
  height: 150px;
  padding-right: var(--space-sm);
}

.y-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  line-height: 1;
}

.chart-area {
  flex: 1;
}

.bars-container {
  display: flex;
  align-items: flex-end;
  height: 150px;
  gap: var(--space-sm);
  padding: 0 var(--space-sm);
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  min-width: 0;
}

.bar-wrapper {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-bottom: var(--space-sm);
}

.bar {
  width: 100%;
  max-width: 40px;
  min-height: 4px;
  border-radius: 2px 2px 0 0;
  position: relative;
  transition: opacity 0.2s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: var(--space-xs);
}

.bar:hover {
  opacity: 0.8;
}

.bar-amount {
  font-size: var(--font-size-xs);
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.bar-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.account-item {
  display: flex;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-background-light);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s;
}

.account-item:hover {
  background: var(--color-background);
}

.account-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--space-sm);
  flex-shrink: 0;
}

.account-icon .van-icon {
  font-size: 16px;
  color: var(--color-primary);
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-balance {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.account-balance.negative {
  color: var(--color-danger);
}

.account-percentage {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-left: var(--space-sm);
}
</style>