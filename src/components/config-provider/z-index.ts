interface ZIndexLayerDefinition {
  readonly cssVariable: `--ex-z-${string}`;
  readonly offset: number;
}

/** 全局层级关系的唯一来源，编程式服务与 CSS 变量必须共用这里的偏移。 */
export const Z_INDEX_LAYER_DEFINITIONS = Object.freeze({
  watermark: Object.freeze({ cssVariable: '--ex-z-watermark', offset: 0 }),
  base: Object.freeze({ cssVariable: '--ex-z-index-base', offset: 0 }),
  dropdown: Object.freeze({ cssVariable: '--ex-z-dropdown', offset: 0 }),
  sticky: Object.freeze({ cssVariable: '--ex-z-sticky', offset: 20 }),
  banner: Object.freeze({ cssVariable: '--ex-z-banner', offset: 30 }),
  overlayBackdrop: Object.freeze({ cssVariable: '--ex-z-overlay-backdrop', offset: 39 }),
  overlay: Object.freeze({ cssVariable: '--ex-z-overlay', offset: 40 }),
  modal: Object.freeze({ cssVariable: '--ex-z-modal', offset: 50 }),
  popover: Object.freeze({ cssVariable: '--ex-z-popover', offset: 60 }),
  toast: Object.freeze({ cssVariable: '--ex-z-toast', offset: 80 }),
  tooltip: Object.freeze({ cssVariable: '--ex-z-tooltip', offset: 90 }),
  loading: Object.freeze({ cssVariable: '--ex-z-loading', offset: 100 }),
} satisfies Readonly<Record<string, ZIndexLayerDefinition>>);

export type ZIndexLayer = keyof typeof Z_INDEX_LAYER_DEFINITIONS;

const MAXIMUM_CSS_Z_INDEX = 2_147_483_647;
const maximumLayerOffset = Math.max(
  ...Object.values(Z_INDEX_LAYER_DEFINITIONS).map(definition => definition.offset)
);

/** 基值预留最高语义层偏移，避免生成超出浏览器整数层级的 CSS 值。 */
export const Z_INDEX_BASE_RANGE = Object.freeze({
  min: 0,
  max: MAXIMUM_CSS_Z_INDEX - maximumLayerOffset,
});

const normalizeZIndexCandidate = (value: number | undefined): number | null => {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < Z_INDEX_BASE_RANGE.min ||
    value > Z_INDEX_BASE_RANGE.max
  ) {
    return null;
  }
  return Math.max(Z_INDEX_BASE_RANGE.min, Math.trunc(value));
};

/** 规范调用方层级；非法值回退最近的已规范层级。 */
export function normalizeZIndexBase(value: number | undefined, fallback: number): number {
  return (
    normalizeZIndexCandidate(value) ?? normalizeZIndexCandidate(fallback) ?? Z_INDEX_BASE_RANGE.min
  );
}

/** 根据语义层级解析相对 ConfigProvider 基值的最终层级。 */
export function resolveZIndexLayer(base: number, layer: ZIndexLayer): number {
  return base + Z_INDEX_LAYER_DEFINITIONS[layer].offset;
}

/** 从统一层级定义生成 ConfigProvider 的全部 CSS 自定义属性。 */
export function createZIndexCssVariables(base: number): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const layer of Object.keys(Z_INDEX_LAYER_DEFINITIONS) as ZIndexLayer[]) {
    const definition = Z_INDEX_LAYER_DEFINITIONS[layer];
    styles[definition.cssVariable] = String(resolveZIndexLayer(base, layer));
  }
  return styles;
}
