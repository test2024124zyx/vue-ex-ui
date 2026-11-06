import { nextTick } from 'vue';
import { createDocumentRuntime } from '../../utils/shared-runtime';

const getRestorers = createDocumentRuntime(
  'native-radio-state',
  () => new WeakMap<HTMLInputElement, () => void>()
);

/** 独立 Radio 也遵守浏览器按树根、表单归属和 name 划分的原生组边界。 */
export function registerNativeRadio(input: HTMLInputElement, restore: () => void) {
  const restorers = getRestorers();
  restorers.set(input, restore);
  return () => restorers.delete(input);
}

export function restoreNativeRadioGroup(input: HTMLInputElement) {
  const root = input.getRootNode() as Document | ShadowRoot | HTMLElement;
  const candidates = input.name
    ? [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(
        candidate => candidate.name === input.name && candidate.form === input.form
      )
    : [input];
  // 默认切换已经取消旧项，必须保存整组，而不是只恢复本次被点击的节点。
  const restorers = candidates.map(candidate => getRestorers().get(candidate));
  void nextTick(() => restorers.forEach(restore => restore?.()));
}
