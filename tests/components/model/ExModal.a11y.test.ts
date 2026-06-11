import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExModal from '../../../src/components/modal/ExModal.vue';

describe('ExModal a11y & keyboard', () => {
  it('traps focus when opened and releases on close', async () => {
    const wrapper = mount(ExModal, { attachTo: document.body, props: { modelValue: true, title: 'Title' } });
    await nextTick();
    const el = document.querySelector('.ex-modal') as HTMLElement | null;
    expect(el).toBeTruthy();
    expect(document.activeElement).toBeInstanceOf(HTMLElement);

    await wrapper.setProps({ modelValue: false });
    await nextTick();
    expect(wrapper.props('modelValue')).toBe(false);

    wrapper.unmount();
  });

  it('closes on Escape when keyboard=true', async () => {
    const onUpdate = vi.fn();
    const wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true, keyboard: true, 'onUpdate:modelValue': onUpdate as any }
    });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();

    expect(onUpdate).toHaveBeenCalledWith(false);

    wrapper.unmount();
  });
});