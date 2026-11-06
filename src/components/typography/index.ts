import ExTypographyComponent from './ExTypography.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExTypography: InstallableComponent<typeof ExTypographyComponent> =
  withInstall(ExTypographyComponent);

// 导出组件完整类型，保证按需引入和根入口的类型契约一致。
export type {
  ExTypographyProps,
  TypographyColor,
  TypographySize,
  TypographyTag,
  TypographyVariant,
} from './types';

export default ExTypography;
