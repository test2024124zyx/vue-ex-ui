import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSpace from '../../../src/components/space/ExSpace.vue';

describe('间距容器的布局选项', () => {
  it.each([
    ['start', 'flex-start'],
    ['end', 'flex-end'],
    ['center', 'center'],
    ['space-between', 'space-between'],
    ['space-around', 'space-around'],
    ['space-evenly', 'space-evenly'],
  ] as const)('justify=%s 正确传递到浏览器布局', (justify, expected) => {
    const wrapper = mount(ExSpace, { props: { justify, align: 'end' } });
    expect((wrapper.element as HTMLElement).style.justifyContent).toBe(expected);
    expect((wrapper.element as HTMLElement).style.alignItems).toBe('flex-end');
    wrapper.unmount();
  });
});
