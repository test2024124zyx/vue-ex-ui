import type { Ref } from 'vue';
import type { CascaderOption } from './types';
import type { CascaderSearchResult } from './search';
import { findNextEnabledIndex } from './keyboard';
import { isComposingKeyboardEvent } from '../../utils/keyboard';

interface KeyboardOptions {
  blocked: () => boolean;
  filterable: () => boolean;
  visible: Ref<boolean>;
  searching: Readonly<Ref<boolean>>;
  results: Readonly<Ref<CascaderSearchResult[]>>;
  menus: Readonly<Ref<CascaderOption[][]>>;
  activePath: Ref<Array<string | number>>;
  activeCol: Ref<number>;
  activeIndex: Ref<number>;
  searchActiveIndex: Ref<number>;
  nextEnabledIndex: (column: number, from: number, step: 1 | -1) => number;
  setMenuActive: (column: number, preferredIndex: number) => void;
  show: () => void;
  hide: () => void;
  selectResult: (result: CascaderSearchResult) => void;
  selectOption: (option: CascaderOption, level: number) => void;
  expandOption: (option: CascaderOption, level: number, index: number) => void;
}

/** 搜索和分列导航共用真实输入焦点，异步分支展开由调用方按请求身份推进。 */
export function useCascaderKeyboard(options: KeyboardOptions) {
  const searchKeydown = (event: KeyboardEvent) => {
    const results = options.results.value;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      options.searchActiveIndex.value = findNextEnabledIndex(
        results,
        options.searchActiveIndex.value,
        event.key === 'ArrowDown' ? 1 : -1
      );
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      options.searchActiveIndex.value = findNextEnabledIndex(
        results,
        event.key === 'Home' ? -1 : results.length,
        event.key === 'Home' ? 1 : -1
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const result = results[options.searchActiveIndex.value];
      if (result && !result.disabled) options.selectResult(result);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      options.hide();
    }
  };
  return (event: KeyboardEvent) => {
    if (isComposingKeyboardEvent(event) || options.blocked()) return;
    if (options.searching.value) {
      searchKeydown(event);
      return;
    }
    if (!options.visible.value) {
      if (
        ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) ||
        (event.key === ' ' && !options.filterable())
      ) {
        event.preventDefault();
        options.show();
        const column = Math.max(0, options.menus.value.length - 1);
        options.activeCol.value = column;
        options.activeIndex.value = options.nextEnabledIndex(
          column,
          event.key === 'ArrowUp' ? options.menus.value[column]?.length || 0 : -1,
          event.key === 'ArrowUp' ? -1 : 1
        );
      }
      return;
    }
    const column = options.menus.value[options.activeCol.value] ?? [];
    const current = column[options.activeIndex.value];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      options.activeIndex.value = options.nextEnabledIndex(
        options.activeCol.value,
        options.activeIndex.value,
        event.key === 'ArrowDown' ? 1 : -1
      );
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (current)
        options.expandOption(current, options.activeCol.value, options.activeIndex.value);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (options.activeCol.value > 0) {
        options.activeCol.value -= 1;
        const value = options.activePath.value[options.activeCol.value];
        const index =
          value === undefined
            ? -1
            : (options.menus.value[options.activeCol.value]?.findIndex(
                option => option.value === value
              ) ?? -1);
        options.setMenuActive(options.activeCol.value, index);
      }
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (event.key === ' ' && options.filterable()) return;
      event.preventDefault();
      if (current) options.selectOption(current, options.activeCol.value);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      options.activeIndex.value = options.nextEnabledIndex(
        options.activeCol.value,
        event.key === 'Home' ? -1 : column.length,
        event.key === 'Home' ? 1 : -1
      );
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      options.hide();
    }
  };
}
