import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSpace from '@/components/space/ExSpace.vue';

describe('ExSpace', () => {
  it('renders with default horizontal direction and role=group', () => {
    const wrapper = mount(ExSpace, { slots: { default: '<div>child</div>' } });
    const root = wrapper.find('.ex-space');
    expect(root.exists()).toBe(true);
    expect(root.attributes('role')).toBe('group');
    const style = root.attributes('style') || '';
    expect(style).toContain('flex-direction: row');
  });

  it('supports vertical direction', () => {
    const wrapper = mount(ExSpace, { props: { direction: 'vertical' }, slots: { default: '<div>child</div>' } });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('flex-direction: column');
  });

  it('uses preset gap for medium by default', () => {
    const wrapper = mount(ExSpace, { slots: { default: '<div>child</div>' } });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('--ex-space-gap: 12px');
  });

  it('supports numeric size as px', () => {
    const wrapper = mount(ExSpace, { props: { size: 20 }, slots: { default: '<div>child</div>' } });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('--ex-space-gap: 20px');
  });

  it('supports wrap', () => {
    const wrapper = mount(ExSpace, { props: { wrap: true }, slots: { default: '<div>child</div>' } });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('flex-wrap: wrap');
  });

  it('supports align and justify', () => {
    const wrapper = mount(ExSpace, { props: { align: 'center', justify: 'space-between' }, slots: { default: '<div>child</div>' } });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('align-items: center');
    expect(style).toContain('justify-content: space-between');
  });
});