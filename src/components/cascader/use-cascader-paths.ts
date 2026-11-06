import { computed, ref } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import type { CascaderOption } from './types';

interface CascaderPathProps {
  options: CascaderOption[];
  modelValue?: Array<string | number> | null;
}

/** 浏览路径可独立展开；确认路径按受控模式提交，禁用状态沿完整祖先链传播。 */
export function useCascaderPaths(props: CascaderPathProps) {
  const { value: selectedPath, request: requestSelectedPath } = useControllableState<
    Array<string | number>
  >({
    controlledValue: () => (props.modelValue === undefined ? undefined : (props.modelValue ?? [])),
    defaultValue: () => [],
    clone: value => [...value],
  });
  const activePath = ref<Array<string | number>>([...selectedPath.value]);
  const columns = computed(() => {
    const result = [{ options: props.options, optionSet: new Set(props.options), disabled: false }];
    for (const value of activePath.value) {
      const previous = result[result.length - 1]!;
      const option = previous.options.find(candidate => candidate.value === value);
      if (!option?.children?.length) break;
      result.push({
        options: option.children,
        optionSet: new Set(option.children),
        disabled: previous.disabled || Boolean(option.disabled),
      });
    }
    return result;
  });
  const menus = computed(() => columns.value.map(column => column.options));
  const isOptionDisabled = (option: CascaderOption, level: number) => {
    const column = columns.value[level];
    return !column || column.disabled || Boolean(option.disabled) || !column.optionSet.has(option);
  };
  const getSelectedOptions = (path = selectedPath.value): CascaderOption[] => {
    const result: CascaderOption[] = [];
    let options = props.options;
    for (const value of path) {
      const option = options.find(candidate => candidate.value === value);
      if (!option) break;
      result.push(option);
      options = option.children ?? [];
    }
    return result;
  };
  const selectedPathDisabled = computed(() => getSelectedOptions().some(option => option.disabled));
  const canSelectPath = (path: Array<string | number>) => {
    const options = getSelectedOptions(path);
    return options.length === path.length && !options.some(option => option.disabled);
  };
  const activePathLabels = computed(() =>
    getSelectedOptions(activePath.value).map(option => option.label)
  );

  return {
    selectedPath,
    requestSelectedPath,
    activePath,
    menus,
    isOptionDisabled,
    getSelectedOptions,
    selectedPathDisabled,
    canSelectPath,
    activePathLabels,
  };
}
