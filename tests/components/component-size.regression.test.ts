import { afterEach, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import ExDivider from '../../src/components/divider/ExDivider.vue';
import ExSkeleton from '../../src/components/skeleton/ExSkeleton.vue';
import type { ComponentSize } from '../../src/components/config-provider/types';

enableAutoUnmount(afterEach);

it('Divider 和 Skeleton 都使用统一尺寸，继承配置且保留原中档类名', async () => {
  const globalSize = ref<ComponentSize>('large');
  const localSize = ref<ComponentSize | 'default'>();
  const wrapper = mount({
    render: () =>
      h(ExConfigProvider, { size: globalSize.value }, () => [
        h(ExDivider, { size: localSize.value }),
        h(ExSkeleton, { size: localSize.value }),
      ]),
  });
  const divider = wrapper.get('.ex-divider');
  const skeleton = wrapper.get('.ex-skeleton');
  expect(divider.classes()).toContain('ex-divider--size-large');
  expect(skeleton.classes()).toContain('ex-skeleton--large');
  localSize.value = 'medium';
  await nextTick();
  expect(divider.classes()).toContain('ex-divider--size-default');
  expect(skeleton.classes()).toContain('ex-skeleton--default');
  localSize.value = 'default';
  await nextTick();
  expect(divider.classes()).toContain('ex-divider--size-default');
  expect(skeleton.classes()).toContain('ex-skeleton--default');
  localSize.value = undefined;
  globalSize.value = 'small';
  await nextTick();
  expect(divider.classes()).toContain('ex-divider--size-small');
  expect(skeleton.classes()).toContain('ex-skeleton--small');
});
