import ExLinkComponent from './ExLink.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 显式导出稳定的公共类型，避免内部实现进入组件 API。
export type {
  ExLinkProps,
  ExLinkEmits,
  ExLinkExposed,
  LinkType,
  LinkSize,
  LinkTarget,
} from './types';

export const ExLink: InstallableComponent<typeof ExLinkComponent> = withInstall(ExLinkComponent);

export default ExLink;
