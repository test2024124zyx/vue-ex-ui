import { computed } from 'vue';
import { useThemeOverrides } from '../components/config-provider/composables';
import { useOverlay } from './useOverlay';
import type { UseOverlayOptions } from './useOverlay';

/** 非模态子面板共享父子层级、Escape 接收权与父弹窗的焦点边界。 */
export function usePopupOverlay(
  options: Pick<
    UseOverlayOptions,
    'active' | 'container' | 'onEscape' | 'zIndex' | 'closeOnEscape' | 'restoreFocus'
  >
) {
  const themeOverrides = useThemeOverrides();
  const overlay = useOverlay({
    ...options,
    lockScroll: () => false,
    trapFocus: () => false,
    autoFocus: () => false,
    restoreFocus: options.restoreFocus ?? true,
    restoreFocusOnlyWhenContained: true,
    onParentClose: () => void options.onEscape?.(),
  });
  const styles = computed<Record<string, string>>(() => ({
    ...themeOverrides.value,
    zIndex: String(overlay.zIndex.value),
  }));
  return { ...overlay, styles };
}
