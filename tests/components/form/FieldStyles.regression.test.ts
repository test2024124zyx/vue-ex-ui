import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileString } from 'sass-embedded';
import { compileStyle } from '@vue/compiler-sfc';
import postcss from 'postcss';
import ExSwitch from '../../../src/components/switch/ExSwitch.vue';
import ExCascader from '../../../src/components/cascader/ExCascader.vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExRate from '../../../src/components/rate/ExRate.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

function selectorsForToken(file: string, scopeId: string, token: string): string[] {
  const source = compileString(readFileSync(file, 'utf8'), {
    url: pathToFileURL(resolve(file)),
  }).css;
  const compiled = compileStyle({ source, filename: file, scoped: true, id: scopeId });
  expect(compiled.errors).toEqual([]);
  const selectors: string[] = [];
  postcss.parse(compiled.code).walkRules(rule => {
    rule.walkDecls(declaration => {
      if (declaration.value.includes(token)) selectors.push(rule.selector);
    });
  });
  return selectors;
}

describe('字段实际 DOM 与公开样式契约', () => {
  it.each(['success', 'warning', 'error'] as const)('选中的 Switch 命中 %s 背景规则', status => {
    const wrapper = mount(ExSwitch, { props: { modelValue: true, validateStatus: status } });
    wrappers.push(wrapper);
    const core = wrapper.get('.ex-switch__core').element;
    const scopeId = (wrapper.element as HTMLElement)
      .getAttributeNames()
      .find(name => name.startsWith('data-v-'))!;
    const selectors = selectorsForToken(
      'src/components/switch/ExSwitch.scss',
      scopeId,
      `linear-gradient(135deg, var(--ex-color-${status})`
    );
    expect(selectors.some(selector => core.matches(selector))).toBe(true);
  });

  it('Teleport Cascader 的动态尺寸样式能够命中浮层选项', async () => {
    const wrapper = mount(ExCascader, {
      props: { size: 'small', options: [{ value: 'a', label: '甲' }] },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    const option = document.querySelector('.ex-cascader__option')!;
    const scopeId = (wrapper.element as HTMLElement)
      .getAttributeNames()
      .find(name => name.startsWith('data-v-'))!;
    const matches = (token: string) =>
      selectorsForToken('src/components/cascader/ExCascader.scss', scopeId, token).some(selector =>
        option.matches(selector)
      );
    expect(matches('--ex-input-height-sm')).toBe(true);
    await wrapper.setProps({ size: 'large' });
    expect(matches('--ex-input-height-lg')).toBe(true);
    expect(matches('--ex-input-height-sm')).toBe(false);
  });

  it('DateTimePicker 的选择状态由 gridcell 承载', async () => {
    const wrapper = mount(ExDateTimePicker, {
      props: { modelValue: new Date(2024, 0, 15) },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('input').trigger('click');
    expect(
      document.querySelector('[role="gridcell"][aria-selected="true"]')?.textContent?.trim()
    ).toBe('15');
    expect(document.querySelector('button[aria-selected]')).toBeNull();
  });

  it('Rate 文本颜色及自定义半星插槽保留公开视觉能力', () => {
    const wrapper = mount(ExRate, {
      props: { modelValue: 1.5, allowHalf: true, showScore: true, textColor: 'red' },
      slots: { 'icon-active': '<span class="custom-star">★</span>' },
    });
    wrappers.push(wrapper);
    expect(wrapper.get<HTMLElement>('.ex-rate__text').element.style.color).toBe('red');
    expect(wrapper.get<HTMLElement>('.is-half .ex-rate__icon--active').element.style.clipPath).toBe(
      'inset(0 50% 0 0)'
    );
  });
});
