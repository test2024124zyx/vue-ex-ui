import ExAvatarComponent from './ExAvatar.vue';
import ExAvatarGroupComponent from './ExAvatarGroup.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
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

export const ExAvatarGroup: InstallableComponent<typeof ExAvatarGroupComponent> =
  withInstall(ExAvatarGroupComponent);
export const ExAvatar: InstallableComponent<typeof ExAvatarComponent> = withInstall(
  ExAvatarComponent,
  { ExAvatarGroup }
);

export default ExAvatar;
