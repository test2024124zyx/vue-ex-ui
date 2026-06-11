import type { App } from 'vue';
import ExAvatar from './ExAvatar.vue';
import ExAvatarGroup from './ExAvatarGroup.vue';
import type {
  ExAvatarProps,
  ExAvatarEmits,
  ExAvatarExposed,
  ExAvatarGroupProps,
  AvatarShape,
  AvatarSize,
  AvatarType,
} from './types';

// 导出组件类型
export type {
  ExAvatarProps,
  ExAvatarEmits,
  ExAvatarExposed,
  ExAvatarGroupProps,
  AvatarShape,
  AvatarSize,
  AvatarType,
};

// 导出组件
export { ExAvatar, ExAvatarGroup };

// 组件安装插件
export const ExAvatarPlugin = {
  install(app: App) {
    app.component('ExAvatar', ExAvatar);
    app.component('ExAvatarGroup', ExAvatarGroup);
  },
};

export default ExAvatarPlugin;
