import type { App } from 'vue';
import ExTimeline from './ExTimeline.vue';
import ExTimelineItem from './ExTimelineItem.vue';

// 导出组件类型
export type {
  ExTimelineProps,
  ExTimelineExposed,
  ExTimelineItemProps,
  ExTimelineItemEmits,
  ExTimelineItemExposed,
  TimelineMode,
  TimelineDirection,
  TimelineItemType,
  TimelineItemSize,
} from './types';

// 导出组件
export { ExTimeline, ExTimelineItem };

// 组件安装插件
export const TimelinePlugin = {
  install(app: App) {
    app.component('ExTimeline', ExTimeline);
    app.component('ExTimelineItem', ExTimelineItem);
  },
};

export default TimelinePlugin;
