import type { App } from 'vue';
import ExDropdown from './ExDropdown.vue';
import ExDropdownItem from './ExDropdownItem.vue';

// 添加 install 方法
ExDropdown.install = (app: App) => {
  app.component('ExDropdown', ExDropdown);
  app.component('ExDropdownItem', ExDropdownItem);
};

export default ExDropdown;
export { ExDropdown, ExDropdownItem };
export * from './types';
