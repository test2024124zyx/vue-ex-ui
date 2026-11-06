import {
  SELECT_DROPDOWN_CONTENT_PADDING,
  SELECT_DROPDOWN_GAP,
  SELECT_DROPDOWN_MAX_HEIGHT,
  SELECT_DROPDOWN_VIEWPORT_PADDING,
} from './constants';

/** 触发器定位计算所需的最小矩形信息。 */
export interface SelectTriggerRect {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

/** 下拉浮层的视口内定位结果。 */
export interface SelectDropdownPosition {
  top: number;
  left: number;
  width: number;
  maxWidth: number;
  maxHeight: number;
  optionsMaxHeight: number;
}

/** 根据触发器与浮层尺寸计算不溢出视口的下拉位置。 */
export function calculateSelectDropdownPosition(
  triggerRect: SelectTriggerRect,
  dropdownHeight: number,
  viewportWidth: number,
  viewportHeight: number
): SelectDropdownPosition {
  const spaceBelow = Math.max(
    0,
    viewportHeight - triggerRect.bottom - SELECT_DROPDOWN_GAP - SELECT_DROPDOWN_VIEWPORT_PADDING
  );
  const spaceAbove = Math.max(
    0,
    triggerRect.top - SELECT_DROPDOWN_GAP - SELECT_DROPDOWN_VIEWPORT_PADDING
  );
  const openAbove = dropdownHeight > spaceBelow && spaceAbove > spaceBelow;
  const maxHeight = Math.min(SELECT_DROPDOWN_MAX_HEIGHT, openAbove ? spaceAbove : spaceBelow);
  const visibleHeight = Math.min(dropdownHeight || maxHeight, maxHeight);
  const width = Math.min(
    triggerRect.width,
    Math.max(0, viewportWidth - SELECT_DROPDOWN_VIEWPORT_PADDING * 2)
  );
  const maxLeft = Math.max(
    SELECT_DROPDOWN_VIEWPORT_PADDING,
    viewportWidth - width - SELECT_DROPDOWN_VIEWPORT_PADDING
  );
  const left = Math.min(Math.max(triggerRect.left, SELECT_DROPDOWN_VIEWPORT_PADDING), maxLeft);
  const preferredTop = openAbove
    ? triggerRect.top - SELECT_DROPDOWN_GAP - visibleHeight
    : triggerRect.bottom + SELECT_DROPDOWN_GAP;
  const maxTop = Math.max(
    SELECT_DROPDOWN_VIEWPORT_PADDING,
    viewportHeight - SELECT_DROPDOWN_VIEWPORT_PADDING - visibleHeight
  );
  const top = Math.min(Math.max(preferredTop, SELECT_DROPDOWN_VIEWPORT_PADDING), maxTop);

  return {
    top,
    left,
    width,
    maxWidth: Math.max(0, viewportWidth - SELECT_DROPDOWN_VIEWPORT_PADDING * 2),
    maxHeight,
    optionsMaxHeight: Math.max(0, maxHeight - SELECT_DROPDOWN_CONTENT_PADDING),
  };
}
