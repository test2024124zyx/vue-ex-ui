import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { Fragment, h, ref, nextTick } from 'vue';
import ExTimeline from '../../../src/components/timeline/ExTimeline.vue';
import ExTimelineItem from '../../../src/components/timeline/ExTimelineItem.vue';

describe('时间线布局与动态内容', () => {
  it.each(['vertical', 'horizontal'] as const)('%s 布局保留完整时间戳、插槽与项目语义', async direction => {
    const wrapper = mount(ExTimeline, {
      props: { direction, mode: 'alternate', class: ['business-timeline'], style: 'padding: 4px' },
      slots: { default: () => [
        h(ExTimelineItem, { timestamp: '10:00', timestampPosition: 'top', color: '#123456', clickable: true, style: { margin: '2px' }, class: { custom: true } }, {
          default: () => '开始', dot: () => h('span', { class: 'custom-dot' }, '●'),
        }),
        h(ExTimelineItem, { timestamp: '11:00', timestampPosition: 'bottom', color: '#654321', hollow: true, style: 'padding: 3px' }, {
          default: () => '结束', timestamp: () => '十一点',
        }),
      ] },
    });
    await nextTick();
    expect(wrapper.findAll('[role="listitem"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('10:00');
    expect(wrapper.text()).toContain('十一点');
    expect(wrapper.get('.custom-dot').text()).toBe('●');
    const nodes = wrapper.findAll<HTMLElement>('.ex-timeline-item__node');
    expect(nodes[0]!.element.style.backgroundColor).toBe('rgb(18, 52, 86)');
    expect(nodes[1]!.element.style.backgroundColor).toBe('');
    expect(wrapper.findAllComponents(ExTimelineItem)[1]!.classes()).toContain(
      direction === 'horizontal' ? 'ex-timeline-item--above' : 'ex-timeline-item--right'
    );
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    await wrapper.setProps({ showLine: false, mode: 'right', style: { padding: '8px' } });
    expect(wrapper.find('.ex-timeline-item__tail').exists()).toBe(false);
    expect(wrapper.find('.ex-timeline-item__tail-horizontal').exists()).toBe(false);
    wrapper.unmount();
  });

  it('左右交替的两侧都支持顶部与底部时间戳，独立子项遵守 hideLine', async () => {
    const position = ref<'top' | 'bottom'>('top');
    const wrapper = mount(ExTimeline, {
      props: { mode: 'alternate' },
      slots: { default: () => [0, 1].map(index => h(ExTimelineItem, {
        timestamp: `时间${index}`, timestampPosition: position.value, hideLine: index === 0,
      }, () => `事件${index}`)) },
    });
    await nextTick();
    expect(wrapper.findAll('.ex-timeline-item__timestamp--top')).toHaveLength(2);
    position.value = 'bottom';
    await nextTick();
    expect(wrapper.findAll('.ex-timeline-item__timestamp--bottom')).toHaveLength(2);
    expect(wrapper.findAllComponents(ExTimelineItem)[0]!.find('.ex-timeline-item__tail').exists()).toBe(false);
    const item = wrapper.findAllComponents(ExTimelineItem)[0]!;
    expect(item.vm.getElement()).toBe(item.element);
    wrapper.unmount();
  });

  it('反转 Fragment 项目后顺序与交替侧保持一致', async () => {
    const wrapper = mount(ExTimeline, {
      props: { reverse: true, mode: 'alternate' },
      slots: { default: () => h(Fragment, {}, [
        h(ExTimelineItem, { key: 'a' }, () => '甲'), h(ExTimelineItem, { key: 'b' }, () => '乙'),
      ]) },
    });
    await nextTick();
    expect(wrapper.findAll('[role="listitem"]').map(item => item.text())).toEqual(['乙', '甲']);
    await wrapper.setProps({ reverse: false });
    expect(wrapper.findAll('[role="listitem"]').map(item => item.text())).toEqual(['甲', '乙']);
    wrapper.unmount();
  });
});
