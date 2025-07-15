<template>
  <div class="trend-chart">
    <div class="chart-header">
      <span class="chart-title">收支趋势</span>
      <div class="chart-controls">
        <div class="chart-toggle">
          <div 
            class="toggle-item"
            :class="{ active: showIncome }"
            @click="toggleIncome"
          >
            <div class="legend-color income"></div>
            <span>收入</span>
          </div>
          <div 
            class="toggle-item"
            :class="{ active: showExpense }"
            @click="toggleExpense"
          >
            <div class="legend-color expense"></div>
            <span>支出</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chart-content">
      <div v-if="!data || data.length === 0" class="no-data">
        暂无数据
      </div>
      
      <div v-else class="chart-container">
        <!-- 简单的图表实现 -->
        <div class="chart-grid">
          <div class="y-axis">
            <div class="y-label" v-for="label in yLabels" :key="label">
              {{ formatAmount(label) }}
            </div>
          </div>
          
          <div class="chart-area">
            <svg viewBox="0 0 300 200" class="chart-svg" preserveAspectRatio="none">
              <!-- 网格线 -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" stroke-width="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <!-- 收入线 -->
              <polyline
                v-if="showIncome"
                :points="incomePoints"
                fill="none"
                stroke="#07c160"
                stroke-width="2"
                class="income-line"
                vector-effect="non-scaling-stroke"
              />
              
              <!-- 支出线 -->
              <polyline
                v-if="showExpense"
                :points="expensePoints"
                fill="none"
                stroke="#ff4444"
                stroke-width="2"
                class="expense-line"
                vector-effect="non-scaling-stroke"
              />
              
              <!-- 收入数据点 -->
              <circle
                v-if="showIncome"
                v-for="(point, index) in dataPoints"
                :key="`income-${index}`"
                :cx="point.x"
                :cy="point.incomeY"
                r="3"
                fill="#07c160"
                class="data-point"
                vector-effect="non-scaling-stroke"
              />
              
              <!-- 支出数据点 -->
              <circle
                v-if="showExpense"
                v-for="(point, index) in dataPoints"
                :key="`expense-${index}`"
                :cx="point.x"
                :cy="point.expenseY"
                r="3"
                fill="#ff4444"
                class="data-point"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
        
        <!-- X轴标签 -->
        <div class="x-axis">
          <div
            v-for="(item, index) in data"
            :key="index"
            class="x-label"
            :class="{
              'first-label': index === 0,
              'last-label': index === data.length - 1
            }"
            :style="{ 
              left: data.length > 1 ? `${(index / (data.length - 1)) * 100}%` : '50%'
            }"
          >
            {{ formatDate(item.date) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatAmount } from '@/utils/number'
import type { TrendData } from '@/types/statistics'

interface Props {
  data: TrendData[]
  period: string
}

const props = defineProps<Props>()

// 显示状态
const showIncome = ref(true)
const showExpense = ref(true)

// 切换方法
const toggleIncome = () => {
  showIncome.value = !showIncome.value
}

const toggleExpense = () => {
  showExpense.value = !showExpense.value
}

// 图表尺寸
const chartWidth = 300
const chartHeight = 200

// 计算Y轴标签
const yLabels = computed(() => {
  if (!props.data || props.data.length === 0) return [0, 25, 50, 75, 100]
  
  const allValues = props.data.flatMap(d => [d.income || 0, d.expense || 0]).filter(v => !isNaN(v) && v > 0)
  
  if (allValues.length === 0) return [0, 25, 50, 75, 100]
  
  const maxAmount = Math.max(...allValues)
  
  if (maxAmount === 0) return [0, 25, 50, 75, 100]
  
  const step = Math.ceil(maxAmount / 4)
  return [0, step, step * 2, step * 3, step * 4]
})

// 计算最大值用于比例计算
const maxValue = computed(() => {
  if (!props.data || props.data.length === 0) return 100
  const max = Math.max(...yLabels.value)
  return max > 0 ? max : 100
})

// 计算数据点坐标
const dataPoints = computed(() => {
  if (!props.data || props.data.length === 0) return []
  
  return props.data.map((item, index) => {
    const safeIncome = item.income || 0
    const safeExpense = item.expense || 0
    
    const x = props.data.length > 1 ? (index / (props.data.length - 1)) * chartWidth : chartWidth / 2
    const incomeY = chartHeight - (safeIncome / maxValue.value) * chartHeight
    const expenseY = chartHeight - (safeExpense / maxValue.value) * chartHeight
    
    // 确保坐标值有效
    return { 
      x: isNaN(x) ? 0 : x, 
      incomeY: isNaN(incomeY) ? chartHeight : incomeY, 
      expenseY: isNaN(expenseY) ? chartHeight : expenseY 
    }
  })
})

// 收入线坐标
const incomePoints = computed(() => {
  if (dataPoints.value.length === 0) return ''
  return dataPoints.value.map(point => `${point.x},${point.incomeY}`).join(' ')
})

// 支出线坐标
const expensePoints = computed(() => {
  if (dataPoints.value.length === 0) return ''
  return dataPoints.value.map(point => `${point.x},${point.expenseY}`).join(' ')
})

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}
</script>

<style scoped>
.trend-chart {
  padding: var(--space-md);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.chart-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-controls {
  display: flex;
  align-items: center;
}

.chart-toggle {
  display: flex;
  gap: var(--space-sm);
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all 0.2s;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-background-light);
  border: 1px solid var(--color-border);
}

.toggle-item:hover {
  background: var(--color-background);
}

.toggle-item.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 600;
}

.toggle-item.active .legend-color {
  box-shadow: 0 0 0 2px var(--color-primary);
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.income {
  background: #07c160;
}

.legend-color.expense {
  background: #ff4444;
}

.chart-content {
  min-height: 280px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 280px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.chart-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.chart-grid {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.y-axis {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  width: 60px;
  height: 200px;
  padding-right: var(--space-sm);
  flex-shrink: 0;
}

.y-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: right;
  line-height: 1;
}

.chart-area {
  flex: 1;
  position: relative;
  height: 200px;
  overflow: hidden;
}

.chart-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.income-line,
.expense-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.data-point {
  cursor: pointer;
  transition: r 0.2s;
}

.data-point:hover {
  r: 4;
}

.x-axis {
  position: relative;
  height: 30px;
  margin-left: 60px;
  width: calc(100% - 60px);
  overflow: visible;
  padding: 0;
}

.x-label {
  position: absolute;
  transform: translateX(-50%);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  top: var(--space-sm);
  white-space: nowrap;
  min-width: 30px;
  text-align: center;
}

.x-label.first-label {
  transform: translateX(0);
}

.x-label.last-label {
  transform: translateX(-100%);
}
</style>