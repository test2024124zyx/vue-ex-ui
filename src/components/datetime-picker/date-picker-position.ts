import type { CSSProperties } from 'vue';

const PANEL_VIEWPORT_GAP = 8;

/** 弹层始终限制在视口内，下方不足时优先使用更大的上方空间。 */
export function getDatePickerPosition(input: HTMLElement, panel: HTMLElement): CSSProperties {
  const triggerRect = input.getBoundingClientRect();
  const panelWidth = panel.offsetWidth;
  const panelHeight = panel.offsetHeight;
  const maxLeft = Math.max(PANEL_VIEWPORT_GAP, window.innerWidth - panelWidth - PANEL_VIEWPORT_GAP);
  const left = Math.min(Math.max(PANEL_VIEWPORT_GAP, triggerRect.left), maxLeft);
  const spaceBelow = window.innerHeight - triggerRect.bottom - PANEL_VIEWPORT_GAP;
  const spaceAbove = triggerRect.top - PANEL_VIEWPORT_GAP;
  const openAbove = spaceBelow < panelHeight && spaceAbove > spaceBelow;
  const desiredTop = openAbove
    ? triggerRect.top - panelHeight - PANEL_VIEWPORT_GAP
    : triggerRect.bottom + PANEL_VIEWPORT_GAP;
  const maxTop = Math.max(
    PANEL_VIEWPORT_GAP,
    window.innerHeight - panelHeight - PANEL_VIEWPORT_GAP
  );
  const top = Math.min(Math.max(PANEL_VIEWPORT_GAP, desiredTop), maxTop);
  return { position: 'fixed', top: `${top}px`, left: `${left}px` };
}
