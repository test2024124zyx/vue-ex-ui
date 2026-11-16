import { computed, onScopeDispose, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { logger } from '../../utils/logger';
import { debounce } from '../../utils/debounce';
import type {
  ExSelectProps,
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectValue,
} from './types';
import { useRemoteOptionCache } from './use-option-cache';

const AUTO_VIRTUAL_OPTION_COUNT = 500;
const LOCAL_SEARCH_DELAY = 100;

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
export function indexSelectOptions(
  options: SelectOptions,
  include?: (option: SelectOption) => boolean
) {
  const visibleOptions: SelectOptions = [];
  const flat: SelectOption[] = [];
  const values: SelectOption['value'][] = [];
  const byValue = new Map<SelectOption['value'], SelectOption>();
  const indices = new Map<SelectOption['value'], number>();
  const rowIndices: number[] = [];
  const rows: SelectVirtualRow[] = [];
  const append = (option: SelectOption) => {
    if (include && !include(option)) return false;
    if (byValue.has(option.value)) {
      logger.warn('ExSelect 的选项值重复，已保留首项。', option.value);
      return false;
    }
    const index = flat.length;
    byValue.set(option.value, option);
    indices.set(option.value, index);
    values.push(option.value);
    rowIndices.push(rows.length);
    rows.push({ key: getOptionKey(option), index, option });
    flat.push(option);
    return true;
  };
  options.forEach(item => {
    if (!isGroup(item)) {
      if (append(item)) visibleOptions.push(item);
      return;
    }
    const headerIndex = rows.length;
    rows.push({ key: '', index: -1 });
    const start = flat.length;
    item.options.forEach(append);
    if (flat.length === start) {
      rows.pop();
      return;
    }
    const group =
      flat.length - start === item.options.length ? item : { ...item, options: flat.slice(start) };
    rows[headerIndex] = { key: getOptionKey(group), index: -1, group };
    visibleOptions.push(group);
  });
  return { options: visibleOptions, flat, values, byValue, indices, rowIndices, rows };
}

/** 选择器的数据查询统一使用缓存索引，避免每一渲染行重复扫描全部选项。 */
export function useSelectOptions(
  props: ExSelectProps,
  searchQuery: Ref<string>,
  source: ComputedRef<SelectOptions> = computed(() => props.options ?? []),
  loading: ComputedRef<boolean> = computed(() => Boolean(props.loading)),
  selection: ComputedRef<SelectValue> = computed(() => props.modelValue ?? null)
) {
  const sourceIndex = computed(() => indexSelectOptions(source.value));
  const flatOptions = computed(() => sourceIndex.value.flat);
  const largeList = computed(() => flatOptions.value.length >= AUTO_VIRTUAL_OPTION_COUNT);
  const deferLocalSearch = computed(() => largeList.value && props.searchable && !props.remote);
  const appliedQuery = ref(searchQuery.value);
  const applyQuery = debounce((query: string) => {
    appliedQuery.value = query;
    return true;
  }, LOCAL_SEARCH_DELAY);
  watch([searchQuery, deferLocalSearch], ([query, deferred]) => {
    if (query && deferred) {
      applyQuery(query);
    } else {
      // 关闭、清空或切换成小列表时立即应用当前值。
      applyQuery.cancel();
      appliedQuery.value = query;
    }
  });
  onScopeDispose(applyQuery.cancel);
  const searchText = computed(
    () =>
      new Map(
        sourceIndex.value.flat.map(option => [
          option,
          [
            option.label.toLowerCase(),
            ...(option.keywords?.map(keyword => keyword.toLowerCase()) ?? []),
          ],
        ])
      )
  );
  const filteredIndex = computed(() => {
    const index = sourceIndex.value;
    if (props.remote || !props.searchable || !appliedQuery.value) return index;
    const query = appliedQuery.value.toLowerCase();
    return indexSelectOptions(index.options, option =>
      searchText.value.get(option)!.some(text => text.includes(query))
    );
  });
  const filteredOptions = computed(() => filteredIndex.value.options);
  const flatFilteredOptions = computed(() => filteredIndex.value.flat);
  const filteredValues = computed(() => filteredIndex.value.values);
  const selectedValues = computed<Array<string | number>>(() =>
    Array.isArray(selection.value) ? selection.value : []
  );
  const selectedSet = computed(() => new Set(selectedValues.value));
  const optionCache = useRemoteOptionCache(
    flatOptions,
    () => props.remote ?? false,
    () => selection.value,
    () => props.multiple ?? false
  );
  const getOptionByValue = (value: string | number): SelectOption | undefined =>
    sourceIndex.value.byValue.get(value) ??
    (props.remote ? optionCache.value.get(value) : undefined);
  const selectedOption = computed(
    () => getOptionByValue(selection.value as string | number) ?? null
  );
  const selectedOptions = computed(() =>
    selectedValues.value.map(getOptionByValue).filter((option): option is SelectOption => !!option)
  );
  const isSelected = (option: SelectOption) =>
    props.multiple ? selectedSet.value.has(option.value) : option.value === selection.value;
  const getFilteredValueIndex = (value: SelectOption['value'] | undefined) =>
    value === undefined ? -1 : (filteredIndex.value.indices.get(value) ?? -1);
  const getOptionIndex = (option: SelectOption) => getFilteredValueIndex(option.value);
  const virtualRows = computed(() => filteredIndex.value.rows);
  const getVirtualRowIndex = (optionIndex: number) =>
    filteredIndex.value.rowIndices[optionIndex] ?? optionIndex;
  const useVirtual = computed(() =>
    Boolean(
      (props.virtual ?? largeList.value) && !loading.value && flatFilteredOptions.value.length
    )
  );
  return {
    filteredOptions,
    flatFilteredOptions,
    filteredValues,
    selectedOption,
    selectedValues,
    selectedOptions,
    getOptionByValue,
    isSelected,
    getOptionIndex,
    getFilteredValueIndex,
    virtualRows,
    getVirtualRowIndex,
    useVirtual,
    flushLocalSearch: applyQuery.flush,
  };
}
