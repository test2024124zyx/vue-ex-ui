import ExTypographyComponent from './ExTypography.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExTypography: InstallableComponent<typeof ExTypographyComponent> =
  withInstall(ExTypographyComponent);

// 导出类型
export type { ExTypographyProps } from './types';

export default ExTypography;
