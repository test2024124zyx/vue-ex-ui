import { computed } from 'vue';
import type { Ref } from 'vue';
import type { ExSelectProps, SelectOption, SelectOptionGroup, SelectOptions } from './types';
import { useRemoteOptionCache } from './use-option-cache';

export const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup =>
  'options' in item;

export const getOptionKey = (item: SelectOption | SelectOptionGroup): string => {
  if (!isGroup(item)) return `option:${typeof item.value}:${String(item.value)}`;
  if (item.key !== undefined) return `group:${typeof item.key}:${String(item.key)}`;
  return `group:${item.label}:${item.options.map(option => `${typeof option.value}:${String(option.value)}`).join('|')}`;
};

export interface SelectVirtualRow {
  key: string;
  index: number;
  option?: SelectOption;
  group?: SelectOptionGroup;
}

/** 单次扫描建立选项索引和展示行索引，分组标题不占用键盘选项索引。 */
export function indexSelectOptions(options: SelectOptions) {
  const flat: SelectOption[] = [];
  const byValue = new Map<SelectOption['value'], SelectOption>();
  const indices = new Map<SelectOption['value'], number>();
  const rowIndices: number[] = [];
  const rows: SelectVirtualRow[] = [];
  const append = (option: SelectOption) => {
    const index = flat.length;
    if (!byValue.has(option.value)) {
      byValue.set(option.value, option);
      indices.set(option.value, index);
    }
    rowIndices.push(rows.length);
    rows.push({ key: getOptionKey(option), index, option });
    flat.push(option);
  };
  options.forEach(item => {
    if (isGroup(item)) {
      rows.push({ key: getOptionKey(item), index: -1, group: item });
      item.options.forEach(append);
    } else append(item);
  });
  return { flat, byValue, indices, rowIndices, rows };
}

/** 选择器的数据查询统一使用缓存索引，避免每一渲染行重复扫描全部选项。 */
export function useSelectOptions(props: ExSelectProps, searchQuery: Ref<string>) {
  const sourceIndex = computed(() => indexSelectOptions(props.options ?? []));
  const flatOptions = computed(() => sourceIndex.value.flat);
  const filteredOptions = computed<SelectOptions>(() => {
    const options = props.options ?? [];
    if (props.remote || !props.searchable || !searchQuery.value) return options;
    const query = searchQuery.value.toLowerCase();
    const matches = (option: SelectOption) =>
      option.label.toLowerCase().includes(query) ||
      Boolean(option.keywords?.some(keyword => keyword.toLowerCase().includes(query)));
    return options.flatMap<SelectOption | SelectOptionGroup>(item => {
      if (!isGroup(item)) return matches(item) ? [item] : [];
      const options = item.options.filter(matches);
      return options.length ? [{ ...item, options }] : [];
    });
  });
  const filteredIndex = computed(() =>
    filteredOptions.value === props.options
      ? sourceIndex.value
      : indexSelectOptions(filteredOptions.value)
  );
  const flatFilteredOptions = computed(() => filteredIndex.value.flat);
  const selectedValues = computed<Array<string | number>>(() =>
    Array.isArray(props.modelValue) ? props.modelValue : []
  );
  const selectedSet = computed(() => new Set(selectedValues.value));
  const optionCache = useRemoteOptionCache(
    flatOptions,
    () => props.remote ?? false,
    () => props.modelValue ?? null,
    () => props.multiple ?? false
  );
  const getOptionByValue = (value: string | number): SelectOption | undefined =>
    sourceIndex.value.byValue.get(value) ??
    (props.remote ? optionCache.value.get(value) : undefined);
  const selectedOption = computed(
    () => getOptionByValue(props.modelValue as string | number) ?? null
  );
  const selectedOptions = computed(() =>
    selectedValues.value.map(getOptionByValue).filter((option): option is SelectOption => !!option)
  );
  const isSelected = (option: SelectOption) =>
    props.multiple ? selectedSet.value.has(option.value) : option.value === props.modelValue;
  const getOptionIndex = (option: SelectOption) =>
    filteredIndex.value.indices.get(option.value) ?? -1;
  const virtualRows = computed(() => filteredIndex.value.rows);
  const getVirtualRowIndex = (optionIndex: number) =>
    filteredIndex.value.rowIndices[optionIndex] ?? optionIndex;
  const useVirtual = computed(() =>
    Boolean(props.virtual && !props.loading && flatFilteredOptions.value.length)
  );
  return {
    filteredOptions,
    flatFilteredOptions,
    selectedOption,
    selectedValues,
    selectedOptions,
    getOptionByValue,
    isSelected,
    getOptionIndex,
    virtualRows,
    getVirtualRowIndex,
    useVirtual,
  };
}
