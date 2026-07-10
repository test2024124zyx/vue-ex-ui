<template>
  <button
    class="ex-theme-switcher"
    type="button"
    :title="`当前主题：${currentLabel} · 点击切换下一个`"
    :aria-label="`切换组件库主题，当前为 ${currentLabel}`"
    @click="cycle"
  >
    <svg
      class="ex-theme-switcher__icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c.93 0 1.5-.76 1.5-1.5 0-.36-.14-.69-.38-.95-.23-.26-.36-.6-.36-.95 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zM6.5 13c-.83 0-1.5-.67-1.5-1.5S5.67 10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 10 17.5 10s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
      />
    </svg>
    <span class="ex-theme-switcher__label">{{ currentLabel }}</span>
    <span
      class="ex-theme-switcher__dot"
      :style="{ background: currentSwatch }"
      aria-hidden="true"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getTheme, onThemeChange, setTheme } from '../../../src';

// 按顺序循环切换组件库的全部主题（matrix 即原 high-contrast 矩阵绿，已含）
const THEMES = [
  { name: 'neon-blue', label: 'Neon Blue', swatch: '#29abe2' },
  { name: 'neon-pink', label: 'Neon Pink', swatch: '#ff007f' },
  { name: 'dark', label: 'Dark', swatch: '#5b9bd5' },
  { name: 'matrix', label: 'Matrix', swatch: '#00ff41' },
  { name: 'light', label: 'Light', swatch: '#1668dc' },
] as const;

const STORAGE_KEY = 'ex-ui-theme';
const current = ref<string>('neon-blue');

const meta = computed(() => THEMES.find(t => t.name === current.value) ?? THEMES[0]);
const currentLabel = computed(() => meta.value.label);
const currentSwatch = computed(() => meta.value.swatch);

let dispose: (() => void) | undefined;

onMounted(() => {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || '';
  const initial = THEMES.some(t => t.name === saved) ? saved : getTheme();
  current.value = initial;
  setTheme(initial as Parameters<typeof setTheme>[0]);
  // 跟随外部主题变化（例如组件内部触发的切换）
  dispose = onThemeChange(theme => {
    current.value = theme;
  });
});

onUnmounted(() => dispose?.());

const cycle = () => {
  const index = THEMES.findIndex(t => t.name === current.value);
  const next = THEMES[(index + 1) % THEMES.length];
  setTheme(next.name as Parameters<typeof setTheme>[0]);
  current.value = next.name;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next.name);
  }
};
</script>

<style scoped>
.ex-theme-switcher {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  margin-left: 4px;
  border: 1px solid var(--ex-color-border-primary, var(--vp-c-divider));
  border-radius: 999px;
  background: var(--ex-color-bg-secondary, var(--vp-c-bg-soft));
  color: var(--ex-color-text-secondary, var(--vp-c-text-2));
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.ex-theme-switcher:hover {
  color: var(--ex-color-primary, var(--vp-c-brand-1));
  border-color: var(--ex-color-primary, var(--vp-c-brand-1));
  box-shadow: 0 0 0 3px var(--ex-color-primary-alpha-10, transparent);
}

.ex-theme-switcher:focus-visible {
  outline: 2px solid var(--ex-color-primary, var(--vp-c-brand-1));
  outline-offset: 2px;
}

.ex-theme-switcher__icon {
  flex-shrink: 0;
}

.ex-theme-switcher__label {
  white-space: nowrap;
}

.ex-theme-switcher__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

/* 窄屏只保留图标与色点，省空间 */
@media (max-width: 768px) {
  .ex-theme-switcher {
    padding: 0 10px;
  }
  .ex-theme-switcher__label {
    display: none;
  }
}
</style>
