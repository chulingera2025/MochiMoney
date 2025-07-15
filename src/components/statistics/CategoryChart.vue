<template>
  <div class="category-chart">
    <div class="chart-header">
      <span class="chart-title">分类占比</span>
    </div>
    
    <div class="chart-content">
      <div v-if="(!expenseData || expenseData.length === 0) && (!incomeData || incomeData.length === 0)" class="no-data">
        暂无数据
      </div>
      
      <div v-else class="charts-container">
        <!-- 支出分类占比 -->
        <div v-if="expenseData && expenseData.length > 0" class="chart-section">
          <div class="section-title">支出分类</div>
          <div class="chart-wrapper">
            <!-- 饼图 -->
            <div class="pie-chart">
              <svg :width="chartSize" :height="chartSize" class="pie-svg">
                <g :transform="`translate(${chartSize / 2}, ${chartSize / 2})`">
                  <path
                    v-for="(segment, index) in expensePieSegments"
                    :key="index"
                    :d="segment.path"
                    :fill="segment.color"
                    :stroke="'#fff'"
                    :stroke-width="2"
                    class="pie-segment"
                    @click="handleSegmentClick(segment)"
                  />
                </g>
              </svg>
              
              <!-- 中心文字 -->
              <div class="pie-center">
                <div class="center-amount">{{ formatAmount(expenseTotalAmount) }}</div>
                <div class="center-label">总支出</div>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="chart-legend">
              <div
                v-for="(item, index) in expenseData"
                :key="item.categoryId"
                class="legend-item"
                @click="handleLegendClick(item)"
              >
                <div
                  class="legend-color"
                  :style="{ backgroundColor: item.categoryColor }"
                ></div>
                <div class="legend-info">
                  <div class="legend-name">{{ item.categoryName }}</div>
                  <div class="legend-stats">
                    <span class="legend-amount">{{ formatAmount(item.amount) }}</span>
                    <span class="legend-percentage">{{ item.percentage.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 收入分类占比 -->
        <div v-if="incomeData && incomeData.length > 0" class="chart-section">
          <div class="section-title">收入分类</div>
          <div class="chart-wrapper">
            <!-- 饼图 -->
            <div class="pie-chart">
              <svg :width="chartSize" :height="chartSize" class="pie-svg">
                <g :transform="`translate(${chartSize / 2}, ${chartSize / 2})`">
                  <path
                    v-for="(segment, index) in incomePieSegments"
                    :key="index"
                    :d="segment.path"
                    :fill="segment.color"
                    :stroke="'#fff'"
                    :stroke-width="2"
                    class="pie-segment"
                    @click="handleSegmentClick(segment)"
                  />
                </g>
              </svg>
              
              <!-- 中心文字 -->
              <div class="pie-center">
                <div class="center-amount">{{ formatAmount(incomeTotalAmount) }}</div>
                <div class="center-label">总收入</div>
              </div>
            </div>
            
            <!-- 图例 -->
            <div class="chart-legend">
              <div
                v-for="(item, index) in incomeData"
                :key="item.categoryId"
                class="legend-item"
                @click="handleLegendClick(item)"
              >
                <div
                  class="legend-color"
                  :style="{ backgroundColor: item.categoryColor }"
                ></div>
                <div class="legend-info">
                  <div class="legend-name">{{ item.categoryName }}</div>
                  <div class="legend-stats">
                    <span class="legend-amount">{{ formatAmount(item.amount) }}</span>
                    <span class="legend-percentage">{{ item.percentage.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { formatAmount } from '@/utils/number'
import type { CategoryData } from '@/types/statistics'

interface Props {
  expenseData: CategoryData[]
  incomeData: CategoryData[]
}

interface Emits {
  (event: 'category-click', data: CategoryData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 图表尺寸
const chartSize = 160
const radius = 65

// 支出总金额
const expenseTotalAmount = computed(() => {
  return props.expenseData?.reduce((sum, item) => sum + item.amount, 0) || 0
})

// 收入总金额
const incomeTotalAmount = computed(() => {
  return props.incomeData?.reduce((sum, item) => sum + item.amount, 0) || 0
})

// 生成饼图分段
const generatePieSegments = (data: CategoryData[]) => {
  if (!data || data.length === 0) return []
  
  const segments: Array<{
    path: string
    color: string
    percentage: number
    name: string
    data: CategoryData
  }> = []
  let currentAngle = 0
  
  data.forEach((item, index) => {
    const percentage = item.percentage / 100
    const angleSize = percentage * 2 * Math.PI
    
    // 计算路径
    const startAngle = currentAngle
    const endAngle = currentAngle + angleSize
    
    const x1 = Math.cos(startAngle) * radius
    const y1 = Math.sin(startAngle) * radius
    const x2 = Math.cos(endAngle) * radius
    const y2 = Math.sin(endAngle) * radius
    
    const largeArcFlag = angleSize > Math.PI ? 1 : 0
    
    const path = [
      `M 0 0`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`
    ].join(' ')
    
    segments.push({
      path,
      color: item.categoryColor,
      percentage: item.percentage,
      name: item.categoryName,
      data: item
    })
    
    currentAngle = endAngle
  })
  
  return segments
}

// 支出饼图分段
const expensePieSegments = computed(() => {
  return generatePieSegments(props.expenseData)
})

// 收入饼图分段
const incomePieSegments = computed(() => {
  return generatePieSegments(props.incomeData)
})

// 处理分段点击
const handleSegmentClick = (segment: any) => {
  emit('category-click', segment.data)
}

// 处理图例点击
const handleLegendClick = (item: CategoryData) => {
  emit('category-click', item)
}
</script>

<style scoped>
.category-chart {
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

.charts-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.chart-section {
  background: var(--color-background-light);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  border: 1px solid var(--color-border-light);
}

.section-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  text-align: center;
}

.chart-wrapper {
  display: flex;
  align-items: flex-start;
  gap: var(--space-lg);
}

.pie-chart {
  position: relative;
  flex-shrink: 0;
}

.pie-svg {
  display: block;
}

.pie-segment {
  cursor: pointer;
  transition: opacity 0.2s;
}

.pie-segment:hover {
  opacity: 0.8;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.center-amount {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
}

.center-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 180px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: background-color 0.2s;
}

.legend-item:hover {
  background-color: var(--color-background);
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-info {
  flex: 1;
  min-width: 0;
}

.legend-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.legend-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-xs);
}

.legend-amount {
  color: var(--color-text-secondary);
}

.legend-percentage {
  color: var(--color-primary);
  font-weight: 600;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .chart-wrapper {
    flex-direction: column;
    align-items: center;
    gap: var(--space-md);
  }
  
  .chart-legend {
    max-height: none;
    width: 100%;
  }
}
</style>