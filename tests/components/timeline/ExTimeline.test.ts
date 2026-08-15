import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExTimeline from '../../../src/components/timeline/ExTimeline.vue';
import ExTimelineItem from '../../../src/components/timeline/ExTimelineItem.vue';

describe('ExTimeline', () => {
  it('renders root and one node per item', () => {
    const wrapper = mount(ExTimeline, {
      slots: {
        default: () => [
          h(ExTimelineItem, {}, () => 'Step 1'),
          h(ExTimelineItem, {}, () => 'Step 2'),
          h(ExTimelineItem, {}, () => 'Step 3'),
        ],
      },
    });
    expect(wrapper.find('.ex-timeline').exists()).toBe(true);
    expect(wrapper.findAll('.ex-timeline-item').length).toBe(3);
    expect(wrapper.text()).toContain('Step 1');
  });

  it('applies reverse modifier', () => {
    const wrapper = mount(ExTimeline, {
      props: { reverse: true },
      slots: { default: () => [h(ExTimelineItem, {}, () => 'x')] },
    });
    expect(wrapper.find('.ex-timeline--reverse').exists()).toBe(true);
  });

  it('reverse 同时反转真实 DOM 与辅助技术读取顺序', () => {
    const wrapper = mount(ExTimeline, {
      props: { reverse: true },
      slots: {
        default: () => [
          h(ExTimelineItem, {}, () => 'First'),
          h(ExTimelineItem, {}, () => 'Second'),
          h(ExTimelineItem, {}, () => 'Third'),
        ],
      },
    });

    expect(wrapper.findAll('.ex-timeline-item').map(item => item.text())).toEqual([
      'Third',
      'Second',
      'First',
    ]);
  });
});

describe('ExTimelineItem', () => {
  it('renders a dot and content', () => {
    const wrapper = mount(ExTimelineItem, { slots: { default: () => 'content' } });
    expect(wrapper.find('.ex-timeline-item').exists()).toBe(true);
    expect(wrapper.find('.ex-timeline-item__dot').exists()).toBe(true);
    expect(wrapper.text()).toContain('content');
  });

  it('emits click when clicked', async () => {
    const wrapper = mount(ExTimelineItem, { slots: { default: () => 'content' } });
    await wrapper.find('.ex-timeline-item').trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('clickable 项同时保留列表项语义与独立按钮语义', async () => {
    const wrapper = mount(ExTimelineItem, {
      props: { clickable: true, ariaLabel: '查看发布记录' },
      slots: { default: () => h('button', { class: 'inner-action' }, '内部操作') },
    });
    const item = wrapper.find('.ex-timeline-item');
    const primaryAction = wrapper.get('.ex-timeline-item__primary-action');
    const innerAction = wrapper.get('.inner-action');

    expect(item.attributes('role')).toBe('listitem');
    expect(item.attributes('tabindex')).toBeUndefined();
    expect(primaryAction.element.tagName).toBe('BUTTON');
    expect(primaryAction.attributes('aria-label')).toBe('查看发布记录');
    expect(primaryAction.element.contains(innerAction.element)).toBe(false);

    await innerAction.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
    await primaryAction.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
