import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExSteps from '../../../src/components/steps/ExSteps.vue';
import ExStep from '../../../src/components/steps/ExStep.vue';

describe('步骤子项的交互与内容', () => {
  it('自定义图标与文字样式保留状态语义，键盘只激活当前操作目标', async () => {
    const wrapper = mount(ExSteps, {
      props: { clickable: true, style: 'padding: 4px' },
      slots: {
        default: () => [
          h(
            ExStep,
            {
              title: '待确认',
              description: '核对详情',
              subtitle: '步骤一',
              iconColor: '#123456',
              titleColor: '#654321',
              style: 'margin: 2px',
            },
            {
              icon: () => h('span', { class: 'custom-icon' }, '✓'),
              description: () => h('input'),
            }
          ),
          h(ExStep, { title: '提交', status: 'error', style: { padding: '2px' } }),
          h(ExStep, { title: '完成', status: 'finish', disabled: true }),
        ],
      },
    });
    const first = wrapper.findAllComponents(ExStep)[0]!;
    expect(first.get('.custom-icon').text()).toBe('✓');
    expect(first.get('.ex-step__subtitle').text()).toBe('步骤一');
    expect(first.vm.getIndex()).toBe(0);
    expect(first.vm.getElement()).toBe(first.element);
    await first.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('change')).toEqual([[0]]);
    await first.get('input').trigger('keydown', { key: 'Enter' });
    await first.trigger('keydown', { key: 'Enter', isComposing: true });
    await first.trigger('keydown', { key: 'Escape' });
    await wrapper.findAllComponents(ExStep)[2]!.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('change')).toHaveLength(1);
    expect(wrapper.find('.ex-step__line--error').exists()).toBe(true);
    wrapper.unmount();
  });
});
