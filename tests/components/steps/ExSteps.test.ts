import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref, defineComponent } from 'vue';
import ExSteps from '../../../src/components/steps/ExSteps.vue';
import ExStep from '../../../src/components/steps/ExStep.vue';
import type { ExStepsExposed } from '../../../src/components/steps/types';

const steps = () => [
  h(ExStep, { title: 'Step 1' }),
  h(ExStep, { title: 'Step 2' }),
  h(ExStep, { title: 'Step 3' }),
];

describe('ExSteps', () => {
  it('renders root and one node per step', () => {
    const wrapper = mount(ExSteps, { props: { current: 0 }, slots: { default: steps } });
    expect(wrapper.find('.ex-steps').exists()).toBe(true);
    expect(wrapper.findAll('.ex-step').length).toBe(3);
    expect(wrapper.text()).toContain('Step 2');
  });

  it('marks exactly the current step', () => {
    const wrapper = mount(ExSteps, { props: { current: 1 }, slots: { default: steps } });
    const current = wrapper.findAll('.ex-step--current');
    expect(current.length).toBe(1);
    expect(current[0].text()).toContain('Step 2');
  });

  it('emits change with the step index when clickable', async () => {
    const wrapper = mount(ExSteps, {
      props: { current: 0, clickable: true },
      slots: { default: steps },
    });
    await wrapper.findAll('.ex-step')[2].trigger('click');
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(2);
  });

  it('does not emit change when not clickable', async () => {
    const wrapper = mount(ExSteps, { props: { current: 0 }, slots: { default: steps } });
    await wrapper.findAll('.ex-step')[2].trigger('click');
    expect(wrapper.emitted('change')).toBeFalsy();
  });

  it('子步骤 clickable 可以覆盖父级不可点击设置', async () => {
    const wrapper = mount(ExSteps, {
      props: { current: 0, clickable: false },
      slots: {
        default: () => [
          h(ExStep, { title: 'Static' }),
          h(ExStep, { title: 'Override', clickable: true }),
        ],
      },
    });

    await wrapper.findAll('.ex-step')[1].trigger('click');

    expect(wrapper.emitted('change')?.at(-1)?.[0]).toBe(1);
  });

  it('公开导航方法会遵守首尾边界并忽略越界索引', () => {
    const wrapper = mount(ExSteps, {
      props: { current: 1 },
      slots: { default: steps },
    });
    const exposed = wrapper.vm as unknown as ExStepsExposed;

    exposed.goTo(-1);
    expect(wrapper.emitted('change')).toBeUndefined();

    exposed.goTo(2);
    exposed.next();
    exposed.prev();
    expect(wrapper.emitted('change')).toEqual([[2], [2], [0]]);

    wrapper.setProps({ current: 2 });
    exposed.next();
    wrapper.setProps({ current: 0 });
    exposed.prev();
    expect(wrapper.emitted('change')).toHaveLength(5);
    expect(exposed.getElement()).toBe(wrapper.element);
  });

  it('应用方向、尺寸、点模式、样式和自定义类', () => {
    const wrapper = mount(ExSteps, {
      props: {
        direction: 'vertical',
        size: 'small',
        progressDot: true,
        clickable: true,
        class: { custom: true },
        style: { color: 'red' },
        ariaLabel: '流程',
      },
      slots: { default: steps },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'ex-steps--vertical',
        'ex-steps--small',
        'ex-steps--progress-dot',
        'ex-steps--clickable',
        'custom',
      ])
    );
    expect(wrapper.attributes('style')).toContain('color: red');
    expect(wrapper.attributes('aria-label')).toBe('流程');
    expect(wrapper.find('.ex-step__icon-number').exists()).toBe(false);
  });

  it('根据步骤状态渲染连接线、图标和自定义颜色', () => {
    const wrapper = mount(ExSteps, {
      props: { current: 1, status: 'error' },
      slots: {
        default: () => [
          h(ExStep, { title: 'Finished' }),
          h(ExStep, { title: 'Failed', status: 'error', lineColor: '#f00' }),
          h(ExStep, { title: 'Waiting', disabled: true }),
        ],
      },
    });
    const rendered = wrapper.findAll('.ex-step');

    expect(rendered[0].classes()).toContain('ex-step--finish');
    expect(rendered[1].classes()).toContain('ex-step--error');
    expect(rendered[1].find('.ex-step__line--error').exists()).toBe(false);
    expect(rendered[1].find('.ex-step__line').attributes('style')).toContain(
      'background-color: #f00'
    );
    expect(rendered[2].classes()).toContain('ex-step--disabled');
    expect(rendered[2].attributes('tabindex')).toBeUndefined();
  });

  it('动态移除步骤后重新计算索引并保留最后步骤标记', async () => {
    const labels = ref(['A', 'B', 'C']);
    const host = defineComponent({
      setup() {
        return () =>
          h(
            ExSteps,
            { current: 1 },
            {
              default: () => labels.value.map(label => h(ExStep, { key: label, title: label })),
            }
          );
      },
    });
    const wrapper = mount(host);

    labels.value = ['A', 'C'];
    await nextTick();

    const rendered = wrapper.findAll('.ex-step');
    expect(rendered).toHaveLength(2);
    expect(rendered[1].classes()).toContain('ex-step--last');
    expect(rendered[1].find('.ex-step__icon-number').text()).toBe('2');
  });
});
