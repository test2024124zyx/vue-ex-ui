import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExList from '../../../src/components/list/ExList.vue';
import type { ListItem } from '../../../src/components/list/types';

describe('ExList', () => {
  const mockData: ListItem[] = [
    { key: 1, title: 'Item 1', description: 'Description 1' },
    { key: 2, title: 'Item 2', description: 'Description 2' },
    { key: 3, title: 'Item 3', description: 'Description 3' },
  ];

  it('renders correctly', () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findAll('.ex-list__item')).toHaveLength(3);
  });

  it('renders with different sizes', () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
        size: 'small',
      },
    });
    expect(wrapper.classes()).toContain('ex-list--small');
  });

  it('renders with border', () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
        bordered: true,
      },
    });
    expect(wrapper.classes()).toContain('ex-list--bordered');
  });

  it('renders without split', () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
        split: false,
      },
    });
    expect(wrapper.classes()).not.toContain('ex-list--split');
  });

  it('renders empty state when no data', () => {
    const wrapper = mount(ExList, {
      props: {
        data: [],
      },
    });
    expect(wrapper.find('.ex-list__empty').exists()).toBe(true);
  });

  it('emits item-click event', async () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
      },
    });
    
    await wrapper.find('.ex-list__item').trigger('click');
    expect(wrapper.emitted('item-click')).toBeTruthy();
  });

  it('renders with avatar', () => {
    const dataWithAvatar: ListItem[] = [
      { key: 1, title: 'Player 1', avatar: 'https://example.com/avatar.jpg' },
    ];
    
    const wrapper = mount(ExList, {
      props: {
        data: dataWithAvatar,
      },
    });
    
    expect(wrapper.find('.ex-list__item-avatar').exists()).toBe(true);
  });

  it('renders with icon', () => {
    const dataWithIcon: ListItem[] = [
      { key: 1, title: 'Item 1', icon: 'https://example.com/icon.svg' },
    ];
    
    const wrapper = mount(ExList, {
      props: {
        data: dataWithIcon,
      },
    });
    
    expect(wrapper.find('.ex-list__item-icon').exists()).toBe(true);
  });

  it('handles disabled items', async () => {
    const dataWithDisabled: ListItem[] = [
      { key: 1, title: 'Item 1', disabled: true },
    ];
    
    const wrapper = mount(ExList, {
      props: {
        data: dataWithDisabled,
      },
    });
    
    await wrapper.find('.ex-list__item').trigger('click');
    expect(wrapper.emitted('item-click')).toBeFalsy();
  });

  it('shows loading state', () => {
    const wrapper = mount(ExList, {
      props: {
        data: mockData,
        loading: true,
      },
    });
    
    expect(wrapper.find('.ex-list__loading').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-list--loading');
  });
});
