import { computed } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import type { CascaderOption, CascaderPath, ExCascaderProps } from './types';

interface MultipleOptions {
  props: Readonly<ExCascaderProps>;
  blocked: () => boolean;
  getOptions: (path: CascaderPath) => CascaderOption[];
  onChange: (paths: CascaderPath[], options: CascaderOption[][]) => void;
}
export const cascaderPathKey = (path: readonly (string | number)[]) => JSON.stringify(path);

/** 多选单独维护完整路径集合，不改变旧单选值和事件的类型。 */
export function useCascaderMultiple(options: MultipleOptions) {
  const clonePaths = (paths: CascaderPath[]) => paths.map(path => [...path]);
  const state = useControllableState<CascaderPath[]>({
    controlledValue: () => options.props.selectedPaths,
    defaultValue: () => [],
    clone: clonePaths,
  });
  const selected = computed(() => {
    const seen = new Set<string>();
    return state.value.value.filter(path => {
      const key = cascaderPathKey(path);
      if (!path.length || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  const selectedKeys = computed(() => new Set(selected.value.map(cascaderPathKey)));
  const isDisabled = (path: CascaderPath) =>
    options.getOptions(path).some(option => option.disabled);
  const isSelected = (path: CascaderPath) => selectedKeys.value.has(cascaderPathKey(path));
  const commit = (paths: CascaderPath[]) => {
    state.request(paths);
    options.onChange(
      clonePaths(paths),
      paths.map(path => options.getOptions(path))
    );
  };
  const toggle = (path: CascaderPath) => {
    if (options.blocked() || isDisabled(path) || options.getOptions(path).length !== path.length)
      return;
    const key = cascaderPathKey(path);
    commit(
      isSelected(path)
        ? selected.value.filter(candidate => cascaderPathKey(candidate) !== key)
        : [...selected.value, [...path]]
    );
  };
  const remove = (path: CascaderPath) => {
    if (options.blocked() || isDisabled(path) || !isSelected(path)) return;
    const key = cascaderPathKey(path);
    commit(selected.value.filter(candidate => cascaderPathKey(candidate) !== key));
  };
  const clear = () => {
    if (!options.blocked()) commit(selected.value.filter(isDisabled));
  };
  const tags = computed(() =>
    selected.value.map(path => {
      const labels = options.getOptions(path).map(option => option.label);
      const text = options.props.showAllLevels
        ? labels.join(options.props.separator)
        : labels[labels.length - 1];
      return {
        path,
        key: cascaderPathKey(path),
        label: text || String(path[path.length - 1]),
        disabled: isDisabled(path),
      };
    })
  );
  const displayTags = computed(() =>
    options.props.collapseTags ? tags.value.slice(0, 1) : tags.value
  );
  return {
    selected,
    isSelected,
    toggle,
    remove,
    clear,
    displayTags,
    collapsedCount: computed(() => tags.value.length - displayTags.value.length),
    canClear: computed(() => selected.value.some(path => !isDisabled(path))),
    getCheckedPaths: () => clonePaths(selected.value),
    getCheckedNodes: () =>
      selected.value
        .map(path => {
          const nodes = options.getOptions(path);
          return nodes[nodes.length - 1];
        })
        .filter((option): option is CascaderOption => Boolean(option)),
  };
}
