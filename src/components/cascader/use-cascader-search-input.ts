import { computed, ref, type Ref } from 'vue';

export function useCascaderSearchInput(
  input: Ref<HTMLInputElement | undefined>,
  confirmedValue: Readonly<Ref<string>>,
  commitSearch: (value: string) => void
) {
  const draft = ref<string | null>(null);
  let discardedComposition = false;
  let ignoredFinalInput: string | null = null;

  const displayValue = computed(() => draft.value ?? confirmedValue.value);

  const restoreDisplay = () => {
    if (input.value) input.value.value = confirmedValue.value;
  };

  const discard = () => {
    discardedComposition ||= draft.value !== null;
    draft.value = null;
    restoreDisplay();
  };

  const startComposition = () => {
    discardedComposition = false;
    ignoredFinalInput = null;
    draft.value = input.value?.value ?? confirmedValue.value;
  };

  const endComposition = () => {
    if (!input.value || (draft.value === null && !discardedComposition)) return;
    const value = input.value.value;
    draft.value = null;
    if (!discardedComposition) {
      commitSearch(value);
      return;
    }
    discardedComposition = false;
    restoreDisplay();
    // 尾随 input 可以出现在微任务之后，保留到第一个输入或下一轮组合。
    ignoredFinalInput = value;
  };

  const handleInput = (event: Event) => {
    if (!input.value) return;
    const value = input.value.value;
    const { isComposing, inputType } = event as InputEvent;
    const cancelledValue = ignoredFinalInput;
    ignoredFinalInput = null;
    if (
      discardedComposition ||
      (cancelledValue !== null &&
        (value === cancelledValue ||
          value === confirmedValue.value ||
          isComposing ||
          inputType === 'insertCompositionText' ||
          inputType === 'insertFromComposition'))
    ) {
      restoreDisplay();
      return;
    }
    if (draft.value !== null || isComposing) {
      draft.value = value;
      return;
    }
    commitSearch(value);
  };

  const isComposing = () => draft.value !== null || discardedComposition;

  return { displayValue, discard, startComposition, endComposition, handleInput, isComposing };
}
