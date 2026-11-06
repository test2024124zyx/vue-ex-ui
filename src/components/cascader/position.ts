import {
  CASCADER_DROPDOWN_GAP,
  CASCADER_DROPDOWN_MAX_HEIGHT,
  CASCADER_VIEWPORT_PADDING,
} from './constants';

/** 触发器定位所需的最小矩形信息。 */
export interface CascaderTriggerRect {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/** 级联面板在视口内的定位结果。 */
export interface CascaderDropdownPosition {
  top: number;
  left: number;
  minWidth: number;
  maxWidth: number;
  maxHeight: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

/** 根据触发器与面板尺寸计算不溢出视口的浮层位置。 */
export function calculateCascaderDropdownPosition(
  triggerRect: CascaderTriggerRect,
  dropdownHeight: number,
  viewportWidth: number,
  viewportHeight: number
): CascaderDropdownPosition {
  const horizontalPadding = CASCADER_VIEWPORT_PADDING * 2;
  const availableWidth = Math.max(0, viewportWidth - horizontalPadding);
  const spaceBelow = Math.max(
    0,
    viewportHeight - triggerRect.bottom - CASCADER_DROPDOWN_GAP - CASCADER_VIEWPORT_PADDING
  );
  const spaceAbove = Math.max(
    0,
    triggerRect.top - CASCADER_DROPDOWN_GAP - CASCADER_VIEWPORT_PADDING
  );
  const openAbove = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;
  const maxHeight = Math.min(CASCADER_DROPDOWN_MAX_HEIGHT, openAbove ? spaceAbove : spaceBelow);
  const visibleHeight = Math.min(dropdownHeight || maxHeight, maxHeight);
  const minWidth = Math.min(Math.max(0, triggerRect.width), availableWidth);
  const left = clamp(
    triggerRect.left,
    CASCADER_VIEWPORT_PADDING,
    viewportWidth - CASCADER_VIEWPORT_PADDING - minWidth
  );
  const preferredTop = openAbove
    ? triggerRect.top - CASCADER_DROPDOWN_GAP - visibleHeight
    : triggerRect.bottom + CASCADER_DROPDOWN_GAP;
  const top = clamp(
    preferredTop,
    CASCADER_VIEWPORT_PADDING,
    viewportHeight - CASCADER_VIEWPORT_PADDING - visibleHeight
  );

  return {
    top,
    left,
    minWidth,
    maxWidth: availableWidth,
    maxHeight,
  };
}
