import type { VNode } from 'vue';

/** Loading 当前真实实现的动画类型。 */
export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'bars' | 'neon';

/** Loading 尺寸。 */
export type LoadingSize = 'small' | 'medium' | 'large';

/** 局部浮层目标容器。 */
export type LoadingTarget = string | HTMLElement;

/** 声明式 Loading 属性。 */
export interface ExLoadingProps {
  /** 是否显示；支持 v-model:visible。 */
  visible?: boolean;
  type?: LoadingType;
  size?: LoadingSize;
  /** 可见文案，同时作为默认无障碍名称。 */
  text?: string;
  /** 加载动画颜色；空白值回退主题令牌。 */
  color?: string;
  /** 是否覆盖整个视口。 */
  fullscreen?: boolean;
  /** 是否显示并启用交互遮罩。 */
  mask?: boolean;
  /** 点击遮罩是否请求关闭。 */
  maskClosable?: boolean;
  /** 局部浮层的传送目标；fullscreen=true 时忽略。 */
  target?: LoadingTarget;
  /** 浮层层级；规范为非负整数。 */
  zIndex?: number;
  /** 全屏遮罩显示时是否锁定页面滚动。 */
  lockScroll?: boolean;
}

/** Loading 事件。 */
export interface ExLoadingEmits {
  'update:visible': [visible: boolean];
  /** 用户或暴露方法请求关闭。 */
  close: [];
}

/** Loading 插槽。 */
export interface ExLoadingSlots {
  /** 替换文本区域。 */
  default?: () => VNode[];
  /** 替换动画区域。 */
  spinner?: () => VNode[];
}

/** Loading 暴露方法。 */
export interface ExLoadingExposed {
  getElement: () => HTMLDivElement | null;
  /** 请求受控关闭。 */
  close: () => void;
}

/** 服务配置由服务管理 visible，其余能力与组件保持一致。 */
export type LoadingServiceConfig = Omit<ExLoadingProps, 'visible'>;

/** 独立服务可覆盖的默认值；定位方式必须由每次 show 明确决定。 */
export type LoadingServiceDefaults = Partial<Omit<LoadingServiceConfig, 'target' | 'fullscreen'>>;

/** 服务实例方法均为真实、必定存在的能力。 */
export interface LoadingServiceInstance {
  show: () => void;
  hide: () => void;
  close: () => void;
  destroy: () => void;
  updateConfig: (config: Partial<LoadingServiceConfig>) => void;
}

/** Loading 服务。 */
export interface LoadingService {
  show: (config?: LoadingServiceConfig) => LoadingServiceInstance;
  hideAll: () => void;
  destroyAll: () => void;
  getInstanceCount: () => number;
}

/** v-loading 对象绑定值。 */
export interface LoadingDirectiveBinding {
  loading: boolean;
  config?: Omit<LoadingServiceConfig, 'target' | 'fullscreen'>;
}

export type LoadingDirectiveValue = boolean | LoadingDirectiveBinding;

/** Loading 插件选项。 */
export interface LoadingPluginOptions {
  defaults?: LoadingServiceDefaults;
  enableDirective?: boolean;
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 当前应用安装的 Loading 服务。 */
    $loading: LoadingService;
  }
}
