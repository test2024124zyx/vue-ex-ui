import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExSteps from '../../../src/components/steps/ExSteps.vue';
import ExStep from '../../../src/components/steps/ExStep.vue';

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
});
