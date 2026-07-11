import { computed, shallowRef, watch } from 'vue';
import type { ComputedRef, ShallowRef } from 'vue';

export interface UseControllableStateOptions<T> {
  /** 动态读取受控值；undefined 明确表示由组件内部管理。 */
  controlledValue: () => T | undefined;
  /** 非受控模式的初始值。 */
  defaultValue: T | (() => T);
  /** 对数组或对象状态创建隔离副本，防止外部引用污染内部状态。 */
  clone?: (value: T) => T;
  /** 每次用户请求变更时调用，无论当前是否受控。 */
  onChange?: (value: T) => void;
}

export interface UseControllableStateReturn<T> {
  /** 当前真实生效的值。 */
  value: ComputedRef<T>;
  /** 当前是否由外部属性控制。 */
  isControlled: ComputedRef<boolean>;
  /** 请求变更；受控模式只通知外部，非受控模式同时提交内部状态。 */
  request: (value: T) => void;
}

/**
 * 统一 Vue 组件的受控/非受控状态语义。
 * 受控模式绝不提前改写可见状态；运行时撤销控制时会保留最后一次真实外部值。
 */
export function useControllableState<T>(
  options: UseControllableStateOptions<T>
): UseControllableStateReturn<T> {
  const clone = options.clone ?? ((value: T) => value);
  const resolveDefaultValue = (): T =>
    typeof options.defaultValue === 'function'
      ? (options.defaultValue as () => T)()
      : options.defaultValue;
  const initialControlledValue = options.controlledValue();
  const internalValue = shallowRef(
    clone(initialControlledValue === undefined ? resolveDefaultValue() : initialControlledValue)
  ) as ShallowRef<T>;

  const isControlled = computed(() => options.controlledValue() !== undefined);
  const value = computed(() => options.controlledValue() ?? internalValue.value);

  watch(options.controlledValue, (nextValue, previousValue) => {
    if (nextValue !== undefined) {
      internalValue.value = clone(nextValue);
    } else if (previousValue !== undefined) {
      // 解除受控时从最后一次已生效的外部值继续，避免跳回陈旧默认值。
      internalValue.value = clone(previousValue);
    }
  });

  const request = (nextValue: T): void => {
    const snapshot = clone(nextValue);
    if (!isControlled.value) {
      internalValue.value = clone(snapshot);
    }
    options.onChange?.(clone(snapshot));
  };

  return { value, isControlled, request };
}
