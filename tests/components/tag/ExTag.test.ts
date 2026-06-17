import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import ExTag from '@/components/tag/ExTag.vue';
import { TagType, TagSize, TagEffect } from '@/components/tag/types';

describe('ExTag.vue', () => {
	it('renders with default props', () => {
		const wrapper = mount(ExTag, {
			slots: {
				default: 'Test Tag'
			}
		});
		expect(wrapper.classes()).toContain('ex-tag');
		expect(wrapper.classes()).toContain('ex-tag--primary');
		expect(wrapper.classes()).toContain('ex-tag--medium');
		expect(wrapper.classes()).toContain('ex-tag--light');
		expect(wrapper.text()).toBe('Test Tag');
	});

	it('renders different types', () => {
		const types: TagType[] = ['success', 'warning', 'danger', 'info'];
		types.forEach((type) => {
			const wrapper = mount(ExTag, {
				props: { type }
			});
			expect(wrapper.classes()).toContain(`ex-tag--${type}`);
		});
	});

	it('renders different sizes', () => {
		const sizes: TagSize[] = ['large', 'small', 'medium'];
		sizes.forEach((size) => {
			const wrapper = mount(ExTag, {
				props: { size }
			});
			expect(wrapper.classes()).toContain(`ex-tag--${size}`);
		});
	});

	it('renders different effects', () => {
		const effects: TagEffect[] = ['dark', 'plain'];
		effects.forEach((effect) => {
			const wrapper = mount(ExTag, {
				props: { effect }
			});
			expect(wrapper.classes()).toContain(`ex-tag--${effect}`);
		});
	});

	it('renders as round', () => {
		const wrapper = mount(ExTag, {
			props: { round: true }
		});
		expect(wrapper.classes()).toContain('is-round');
	});

	it('renders as closable and emits close event', async () => {
		const wrapper = mount(ExTag, {
			props: { closable: true }
		});
		expect(wrapper.find('.ex-tag__close').exists()).toBe(true);
		await wrapper.find('.ex-tag__close').trigger('click');
		expect(wrapper.emitted().close).toBeTruthy();
	});

	it('emits click event', async () => {
		const wrapper = mount(ExTag);
		await wrapper.trigger('click');
		expect(wrapper.emitted().click).toBeTruthy();
	});

	it('renders with custom colors', () => {
		const wrapper = mount(ExTag, {
			props: {
				color: 'rgb(255, 0, 0)',
				bgColor: 'rgb(0, 255, 0)',
				borderColor: 'rgb(0, 0, 255)'
			}
		});
		const style = wrapper.attributes('style');
		expect(style).toContain('--ex-tag-text-color: rgb(255, 0, 0)');
		expect(style).toContain('--ex-tag-bg-color: rgb(0, 255, 0)');
		expect(style).toContain('--ex-tag-border-color: rgb(0, 0, 255)');
	});

	it('renders prefix slot', () => {
		const wrapper = mount(ExTag, {
			slots: {
				prefix: '<span class="prefix-icon">prefix</span>'
			}
		});
		expect(wrapper.find('.ex-tag__prefix').exists()).toBe(true);
		expect(wrapper.find('.prefix-icon').exists()).toBe(true);
	});

	it('renders close slot', () => {
		const wrapper = mount(ExTag, {
			props: { closable: true },
			slots: {
				close: '<span class="close-icon">close</span>'
			}
		});
		expect(wrapper.find('.ex-tag__close').exists()).toBe(true);
		expect(wrapper.find('.close-icon').exists()).toBe(true);
	});
});