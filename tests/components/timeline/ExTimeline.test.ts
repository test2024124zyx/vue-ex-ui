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

  it('exposes keyboard semantics when clickable', async () => {
    const wrapper = mount(ExTimelineItem, {
      props: { clickable: true },
      slots: { default: () => 'content' },
    });
    const item = wrapper.find('.ex-timeline-item');

    expect(item.attributes('role')).toBe('button');
    expect(item.attributes('tabindex')).toBe('0');
    await item.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('click')).toHaveLength(1);
  });
});
