import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExConfigProvider from '@/components/config-provider/ExConfigProvider.vue';
import ExSpace from '@/components/space/ExSpace.vue';

describe('ExSpace', () => {
  it('renders with default horizontal direction', () => {
    const wrapper = mount(ExSpace, { slots: { default: '<div>child</div>' } });
    const root = wrapper.find('.ex-space');
    expect(root.exists()).toBe(true);
    expect(root.classes()).toContain('ex-space--horizontal');
    // 纯布局容器不应携带 ARIA role
    expect(root.attributes('role')).toBeUndefined();
    const style = root.attributes('style') || '';
    expect(style).toContain('flex-direction: row');
    expect(root.element.style.getPropertyValue('--ex-space-gap')).toBe('16px');
  });

  it('supports vertical direction', () => {
    const wrapper = mount(ExSpace, {
      props: { direction: 'vertical' },
      slots: { default: '<div>child</div>' },
    });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('flex-direction: column');
  });

  it.each([
    ['small', '8px'],
    ['medium', '16px'],
    ['large', '24px'],
  ] as const)('uses the canonical %s spacing preset', (size, expectedGap) => {
    const wrapper = mount(ExSpace, {
      props: { size },
      slots: { default: '<div>child</div>' },
    });

    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe(expectedGap);
  });

  it('supports numeric size and CSS length values', async () => {
    const wrapper = mount(ExSpace, { props: { size: 20 }, slots: { default: '<div>child</div>' } });
    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe('20px');

    await wrapper.setProps({ size: 'var(--ex-spacing-4)' });
    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe('var(--ex-spacing-4)');
  });

  it('normalizes invalid numeric values without emitting invalid CSS', async () => {
    const wrapper = mount(ExSpace, { props: { size: -4 } });
    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe('0px');

    await wrapper.setProps({ size: Number.NaN });
    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe('16px');

    await wrapper.setProps({ size: Number.POSITIVE_INFINITY });
    expect(wrapper.element.style.getPropertyValue('--ex-space-gap')).toBe('16px');
  });

  it('supports wrap', () => {
    const wrapper = mount(ExSpace, {
      props: { wrap: true },
      slots: { default: '<div>child</div>' },
    });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(wrapper.classes()).toContain('is-wrap');
    expect(style).toContain('flex-wrap: wrap');
  });

  it('supports align and justify', () => {
    const wrapper = mount(ExSpace, {
      props: { align: 'center', justify: 'space-between' },
      slots: { default: '<div>child</div>' },
    });
    const style = wrapper.find('.ex-space').attributes('style') || '';
    expect(style).toContain('align-items: center');
    expect(style).toContain('justify-content: space-between');
  });

  it('inherits ConfigProvider size and allows an explicit Space size to override it', () => {
    const wrapper = mount({
      components: { ExConfigProvider, ExSpace },
      template: `
        <ExConfigProvider size="large">
          <ExSpace class="inherited" />
          <ExSpace class="overridden" size="small" />
        </ExConfigProvider>
      `,
    });

    expect(wrapper.get('.inherited').element.style.getPropertyValue('--ex-space-gap')).toBe('24px');
    expect(wrapper.get('.overridden').element.style.getPropertyValue('--ex-space-gap')).toBe('8px');
  });

  it('forwards native attributes, renders slot content and exposes the root element', () => {
    const wrapper = mount(ExSpace, {
      attrs: { id: 'actions', 'aria-label': 'Actions', class: 'custom-space' },
      slots: { default: '<button type="button">Save</button>' },
    });
    const exposed = wrapper.vm as unknown as { getElement: () => HTMLElement | null };

    expect(wrapper.attributes('id')).toBe('actions');
    expect(wrapper.attributes('aria-label')).toBe('Actions');
    expect(wrapper.classes()).toContain('custom-space');
    expect(wrapper.get('button').text()).toBe('Save');
    expect(exposed.getElement()).toBe(wrapper.element);
  });
});
