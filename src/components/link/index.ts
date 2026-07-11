import ExLinkComponent from './ExLink.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type {
  ExLinkProps,
  ExLinkEmits,
  ExLinkExposed,
  LinkType,
  LinkSize,
  LinkTarget,
} from './types';

// 导出组件
export const ExLink: InstallableComponent<typeof ExLinkComponent> = withInstall(ExLinkComponent);

export default ExLink;
