import { componentDirectories } from './component-map';

export interface ExUIResolverOptions {
  /** 默认自动引入基础主题样式，宿主已统一加载时可关闭。 */
  includeBaseStyles?: boolean;
  /** 品牌字体默认不加载，由产品按需启用。 */
  includeFonts?: boolean;
}

export interface ExUIResolvedComponent {
  name: string;
  from: string;
  sideEffects: string[];
}

/** 自动导入解析器只依赖静态映射，不加载 Vue 或组件，兼容构建工具的组件解析接口。 */
export function ExUIResolver(options: ExUIResolverOptions = {}): {
  type: 'component';
  resolve: (name: string) => ExUIResolvedComponent | undefined;
} {
  return {
    type: 'component',
    resolve(name) {
      const directory = componentDirectories.get(name);
      if (!directory) return undefined;

      const sideEffects: string[] = [];
      if (options.includeBaseStyles !== false) sideEffects.push('vue-ex-ui/base.css');
      if (options.includeFonts) sideEffects.push('vue-ex-ui/font.css');

      return { name, from: `vue-ex-ui/es/components/${directory}`, sideEffects };
    },
  };
}

export default ExUIResolver;
