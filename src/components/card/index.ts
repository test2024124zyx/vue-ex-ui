import type { App } from 'vue';
import ExCard from './ExCard.vue';

// 导出组件类型
export type { ExCardProps, ExCardEmits, ExCardExposed } from './types';
export type { CardType, CardSize, CardShadow } from './types';

// 为组件添加 install 方法
ExCard.install = (app: App) => {
  app.component(ExCard.name as string, ExCard);
};

export { ExCard };
export default ExCard;
