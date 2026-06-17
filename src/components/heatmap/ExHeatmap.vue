<template>
  <div
    ref="heatmapRef"
    :class="heatmapClasses"
    :style="heatmapStyles"
  >
    <!-- 月份标签 -->
    <div
      v-if="showMonthLabels && data.length > 0"
      class="ex-heatmap__months"
    >
      <div
        v-for="(month, index) in monthLabels"
        :key="index"
        class="ex-heatmap__month-label"
        :style="{ left: month.offset + 'px' }"
      >
        {{ month.label }}
      </div>
    </div>

    <!-- 热力图主体 -->
    <div
      v-if="data.length > 0"
      class="ex-heatmap__body"
    >
      <!-- 星期标签 -->
      <div
        v-if="showWeekLabels"
        class="ex-heatmap__weeks"
      >
        <div
          v-for="(week, index) in weekLabels"
          :key="index"
          class="ex-heatmap__week-label"
        >
          {{ week }}
        </div>
      </div>

      <!-- 热力图网格 -->
      <div class="ex-heatmap__grid">
        <div
          v-for="(week, weekIndex) in gridData"
          :key="weekIndex"
          class="ex-heatmap__column"
        >
          <div
            v-for="(day, dayIndex) in week"
            :key="dayIndex"
            :class="getCellClasses(day)"
            :style="getCellStyle(day)"
            :title="getCellTitle(day)"
            role="button"
            :tabindex="0"
            :aria-label="getCellTitle(day)"
            @click="handleCellClick(day, $event)"
            @keydown="handleCellKeydown(day, $event)"
            @mouseenter="handleCellHover(day)"
            @mouseleave="handleCellHover(null)"
            @focus="handleCellHover(day)"
            @blur="handleCellHover(null)"
          >
            <div
              v-if="showTooltip && hoveredCell === day"
              class="ex-heatmap__tooltip"
            >
              <div class="ex-heatmap__tooltip-date">
                {{ formatDate(day.date) }}
              </div>
              <div class="ex-heatmap__tooltip-value">
                {{ day.value || 0 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div
      v-if="data.length > 0"
      class="ex-heatmap__legend"
    >
      <span class="ex-heatmap__legend-label">{{ t('heatmap.less') }}</span>
      <div
        v-for="level in 5"
        :key="level"
        class="ex-heatmap__legend-item"
        :data-level="level - 1"
      />
      <span class="ex-heatmap__legend-label">{{ t('heatmap.more') }}</span>
    </div>

    <!-- 空数据 -->
    <div
      v-if="data.length === 0"
      class="ex-heatmap__empty"
    >
      <slot name="empty">
        <ExIcon
          icon="calendar-line"
          :size="48"
          style="opacity: 0.3; margin-bottom: 12px"
          aria-hidden="true"
        />
        <p>{{ emptyText || t('heatmap.empty') }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref } from 'vue';
import type { ExHeatmapProps, ExHeatmapEmits, ExHeatmapExposed, HeatmapDataItem } from './types';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExHeatmap',
});

const props = withDefaults(defineProps<ExHeatmapProps>(), {
  size: 'medium',
  theme: 'neon',
  showMonthLabels: true,
  showWeekLabels: true,
  showTooltip: true,
  gap: 4,
  radius: 2,
});

const emit = defineEmits<ExHeatmapEmits>();

const heatmapRef = ref<HTMLDivElement>();
const hoveredCell = ref<HeatmapDataItem | null>(null);
const { t } = useI18n();

// 计算属性
const heatmapClasses = computed(() => {
  const classes = ['ex-heatmap', `ex-heatmap--${props.size}`, `ex-heatmap--${props.theme}`];

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const heatmapStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 计算日期范围
const dateRange = computed(() => {
  const end = props.endDate ? new Date(props.endDate) : new Date();
  const start = props.startDate
    ? new Date(props.startDate)
    : new Date(end.getTime() - 364 * 24 * 60 * 60 * 1000); // 默认显示一年

  return { start, end };
});

// 计算最大值
const maxValue = computed(() => {
  if (props.maxValue) return props.maxValue;
  return Math.max(...props.data.map(d => d.value), 1);
});

// 生成网格数据
const gridData = computed(() => {
  const { start, end } = dateRange.value;
  const weeks: HeatmapDataItem[][] = [];
  const dataMap = new Map(props.data.map(d => [d.date, d]));

  // 找到开始日期所在周的周日
  const startDay = new Date(start);
  startDay.setDate(startDay.getDate() - startDay.getDay());

  let currentDate = new Date(startDay);
  let currentWeek: HeatmapDataItem[] = [];

  while (currentDate <= end) {
    const dateStr = formatDateStr(currentDate);
    const data = dataMap.get(dateStr);

    currentWeek.push({
      date: dateStr,
      value: data?.value || 0,
      ...data,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
});

// 月份标签
const monthLabels = computed(() => {
  const labels: { label: string; offset: number }[] = [];
  const cellSize = getCellSize();
  const gap = props.gap;

  gridData.value.forEach((week, _index) => {
    const firstDay = week[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      if (date.getDate() <= 7) {
        labels.push({
          label: date.toLocaleDateString('zh-CN', { month: 'short' }),
          offset: _index * (cellSize + gap),
        });
      }
    }
  });

  return labels;
});

// 星期标签（取周一/三/五，跟随语言包）
const weekLabels = computed(() => {
  const days = t('calendar.weekdaysShort').split(',');
  return [days[1], days[3], days[5]];
});

// 获取单元格大小
const getCellSize = () => {
  const sizes = { small: 10, medium: 12, large: 14 };
  return sizes[props.size];
};

// 获取单元格类名
const getCellClasses = (day: HeatmapDataItem) => {
  const classes = ['ex-heatmap__cell'];
  const level = getLevel(day.value);
  classes.push(`ex-heatmap__cell--level-${level}`);
  return classes;
};

// 获取单元格样式
const getCellStyle = (_day: HeatmapDataItem) => {
  const cellSize = getCellSize();
  return {
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    borderRadius: `${props.radius}px`,
  };
};

// 获取单元格标题
const getCellTitle = (day: HeatmapDataItem) => {
  return `${formatDate(day.date)}: ${day.value || 0}`;
};

// 计算颜色等级（0-4）
const getLevel = (value: number) => {
  if (value === 0) return 0;
  const ratio = value / maxValue.value;
  if (ratio <= 0.2) return 1;
  if (ratio <= 0.4) return 2;
  if (ratio <= 0.6) return 3;
  return 4;
};

// 格式化日期字符串
const formatDateStr = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化日期显示
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// 事件处理（任意单元格均可点击，由消费方决定如何处理空值日）
const handleCellClick = (day: HeatmapDataItem, event: MouseEvent) => {
  emit('cell-click', day, event);
};

// 键盘支持（Enter/Space 触发点击）
const handleCellKeydown = (day: HeatmapDataItem, event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('cell-click', day, event as unknown as MouseEvent);
  }
};

const handleCellHover = (day: HeatmapDataItem | null) => {
  hoveredCell.value = day;
  emit('cell-hover', day);
};

// 暴露的方法
const getElement = () => heatmapRef.value || null;

// 刷新：清除当前悬浮/聚焦的瞬时状态（网格数据由 props 响应式驱动，会自动重渲染）
const refresh = () => {
  hoveredCell.value = null;
};

defineExpose<ExHeatmapExposed>({
  getElement,
  refresh,
});
</script>

<style scoped lang="scss" src="./ExHeatmap.scss"></style>
