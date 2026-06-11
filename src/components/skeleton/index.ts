import type { App } from 'vue';
import ExSkeleton from './ExSkeleton.vue';

// 导出组件类型
export type { ExSkeletonProps, ExSkeletonExposed } from './types';
export type {
  SkeletonAnimation,
  SkeletonShape,
  SkeletonSize,
  SkeletonVariant,
} from './types';

// 为组件添加 install 方法
ExSkeleton.install = (app: App) => {
  app.component(ExSkeleton.name as string, ExSkeleton);
};

export { ExSkeleton };
export default ExSkeleton;
