import ExTimelineComponent from './ExTimeline.vue';
import ExTimelineItemComponent from './ExTimelineItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

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
export const ExTimelineItem: InstallableComponent<typeof ExTimelineItemComponent> =
  withInstall(ExTimelineItemComponent);
export const ExTimeline: InstallableComponent<typeof ExTimelineComponent> = withInstall(
  ExTimelineComponent,
  { ExTimelineItem }
);

export default ExTimeline;
