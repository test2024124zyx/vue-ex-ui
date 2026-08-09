import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ExTagInput from '@/components/tag/ExTagInput.vue';

describe('ExTagInput.vue', () => {
  const startEditing = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.find('.ex-tag-input__button').trigger('click');
    await wrapper.vm.$nextTick();
  };

  it('renders the add action with the configured size', () => {
    const wrapper = mount(ExTagInput, {
      props: { size: 'large', buttonText: 'Add status' },
    });

    expect(wrapper.find('.ex-tag-input__button').classes()).toContain(
      'ex-tag-input__button--large'
    );
    expect(wrapper.find('.ex-tag-input__button').attributes('aria-label')).toBe('Add status');
  });

  it('enters editing mode and focuses the input', async () => {
    const wrapper = mount(ExTagInput, { attachTo: document.body });

    await startEditing(wrapper);

    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);
    expect(document.activeElement).toBe(input.element);

    wrapper.unmount();
  });

  it('trims the value before confirming with Enter', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    const input = wrapper.find('input');
    await input.setValue('  New status  ');
    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('confirm')).toEqual([['New status']]);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('cancels empty input instead of confirming it', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    await wrapper.find('input').setValue('   ');
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('confirm')).toBeUndefined();
    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('emits duplicate and keeps editing when the value already exists', async () => {
    const wrapper = mount(ExTagInput, {
      props: { existingTags: [' New status '] },
    });

    await startEditing(wrapper);
    await wrapper.find('input').setValue('New status');
    await wrapper.find('input').trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('duplicate')).toEqual([['New status']]);
    expect(wrapper.emitted('confirm')).toBeUndefined();
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('[role="alert"]').text()).toBe('Tag "New status" already exists');
    expect(wrapper.find('input').exists()).toBe(true);

    await wrapper.find('input').setValue('Another status');
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined();
  });

  it('confirms from the action button without losing the value to blur', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    await wrapper.find('input').setValue('Button status');
    await wrapper.find('.ex-tag-input__action--confirm').trigger('click');

    expect(wrapper.emitted('confirm')).toEqual([['Button status']]);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('cancels from the action button and clears the draft', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    await wrapper.find('input').setValue('Draft status');
    await wrapper.find('.ex-tag-input__action--cancel').trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('does not cancel when focus moves between controls', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    const input = wrapper.find('input');
    const confirmButton = wrapper.find('.ex-tag-input__action--confirm');
    await input.trigger('blur', { relatedTarget: confirmButton.element });

    expect(wrapper.emitted('cancel')).toBeUndefined();
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('cancels when focus leaves the editing wrapper', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    await wrapper.find('input').trigger('blur', { relatedTarget: document.body });

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('cancels from the Escape key', async () => {
    const wrapper = mount(ExTagInput);

    await startEditing(wrapper);
    await wrapper.find('input').trigger('keydown', { key: 'Escape' });

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.find('input').exists()).toBe(false);
  });
});
