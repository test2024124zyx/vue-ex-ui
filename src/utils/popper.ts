// ExUI 浮层定位工具
//
// Tooltip / Popover 共用的轻量定位实现：根据触发元素与浮层矩形计算 fixed 坐标，
// 支持主轴翻转（flip：空间不足时翻到对侧，避免遮挡触发元素）与视口夹取（clamp）。
// 返回最终生效的 placement，便于组件同步箭头方向的类名。

export type PopperPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

type PopperSide = 'top' | 'bottom' | 'left' | 'right';
type PopperAlign = 'start' | 'end' | undefined;

export interface PopperRect {
  width: number;
  height: number;
}

export interface PopperPositionResult {
  top: number;
  left: number;
  /** flip 后最终生效的 placement */
  placement: string;
}

const OPPOSITE: Record<PopperSide, PopperSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const VIEWPORT_PADDING = 8;

/**
 * 计算浮层相对视口的 fixed 坐标（配合 position: fixed 使用）
 *
 * @param trigger 触发元素的 getBoundingClientRect()
 * @param popper  浮层尺寸（width/height）
 * @param placement 期望位置
 * @param offset  浮层与触发元素的间距
 */
export function calcPopperPosition(
  trigger: DOMRect,
  popper: PopperRect,
  placement: string,
  offset: number
): PopperPositionResult {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const parts = placement.split('-');
  const rawSide = parts[0] ?? 'top';
  const rawAlign = parts[1];
  let side: PopperSide = (
    ['top', 'bottom', 'left', 'right'].includes(rawSide) ? rawSide : 'top'
  ) as PopperSide;
  const align: PopperAlign = rawAlign === 'start' || rawAlign === 'end' ? rawAlign : undefined;

  // 主轴翻转：当前侧空间不足且对侧空间更大时翻转
  // 仅在浮层已被测量（有真实尺寸）时才翻转，避免首帧/无布局环境下误翻转
  const canMeasure = popper.width > 0 && popper.height > 0;
  const space: Record<PopperSide, number> = {
    top: trigger.top,
    bottom: vh - trigger.bottom,
    left: trigger.left,
    right: vw - trigger.right,
  };
  const need = side === 'top' || side === 'bottom' ? popper.height + offset : popper.width + offset;
  if (canMeasure && space[side] < need && space[OPPOSITE[side]] > space[side]) {
    side = OPPOSITE[side];
  }

  const centerX = trigger.left + (trigger.width - popper.width) / 2;
  const centerY = trigger.top + (trigger.height - popper.height) / 2;

  let top = 0;
  let left = 0;

  switch (side) {
    case 'top':
      top = trigger.top - popper.height - offset;
      left =
        align === 'start' ? trigger.left : align === 'end' ? trigger.right - popper.width : centerX;
      break;
    case 'bottom':
      top = trigger.bottom + offset;
      left =
        align === 'start' ? trigger.left : align === 'end' ? trigger.right - popper.width : centerX;
      break;
    case 'left':
      left = trigger.left - popper.width - offset;
      top =
        align === 'start'
          ? trigger.top
          : align === 'end'
            ? trigger.bottom - popper.height
            : centerY;
      break;
    case 'right':
      left = trigger.right + offset;
      top =
        align === 'start'
          ? trigger.top
          : align === 'end'
            ? trigger.bottom - popper.height
            : centerY;
      break;
  }

  // 视口夹取，避免浮层超出可视区域
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
  if (left + popper.width > vw - VIEWPORT_PADDING) left = vw - popper.width - VIEWPORT_PADDING;
  if (top < VIEWPORT_PADDING) top = VIEWPORT_PADDING;
  if (top + popper.height > vh - VIEWPORT_PADDING) top = vh - popper.height - VIEWPORT_PADDING;

  return { top, left, placement: align ? `${side}-${align}` : side };
}
