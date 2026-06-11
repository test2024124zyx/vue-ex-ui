import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExMenu from '../../../src/components/menu/ExMenu.vue';
import ExMenuItem from '../../../src/components/menu/ExMenuItem.vue';
import ExSubMenu from '../../../src/components/menu/ExSubMenu.vue';

describe('ExMenu', () => {
  it('renders correctly', () => {
    const wrapper = mount(ExMenu, {
      slots: {
        default: '<div>Menu Content</div>',
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.ex-menu').exists()).toBe(true);
  });

  it('renders with vertical mode by default', () => {
    const wrapper = mount(ExMenu, {
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.ex-menu--vertical').exists()).toBe(true);
  });

  it('renders with horizontal mode', () => {
    const wrapper = mount(ExMenu, {
      props: {
        mode: 'horizontal',
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.ex-menu--horizontal').exists()).toBe(true);
  });

  it('renders with inline mode', () => {
    const wrapper = mount(ExMenu, {
      props: {
        mode: 'inline',
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.ex-menu--inline').exists()).toBe(true);
  });

  it('applies custom class', () => {
    const wrapper = mount(ExMenu, {
      props: {
        class: 'custom-menu',
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.custom-menu').exists()).toBe(true);
  });

  it('renders collapsed menu', () => {
    const wrapper = mount(ExMenu, {
      props: {
        mode: 'inline',
        collapsed: true,
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.find('.ex-menu--collapsed').exists()).toBe(true);
  });

  it('renders menu items from data', () => {
    const items = [
      { key: '1', label: 'Item 1' },
      { key: '2', label: 'Item 2' },
    ];
    const wrapper = mount(ExMenu, {
      props: {
        items,
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    expect(wrapper.findAll('.ex-menu-item')).toHaveLength(2);
  });

  it('emits select event when menu item is clicked', async () => {
    const wrapper = mount(ExMenu, {
      slots: {
        default: `
          <ExMenuItem item-key="1">Item 1</ExMenuItem>
        `,
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });

    await wrapper.findComponent(ExMenuItem).trigger('click');
    expect(wrapper.emitted('select')).toBeTruthy();
  });

  it('updates active key', async () => {
    const wrapper = mount(ExMenu, {
      props: {
        activeKey: '1',
      },
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });

    await wrapper.setProps({ activeKey: '2' });
    const vm = wrapper.vm as any;
    expect(vm.getActiveKey()).toBe('2');
  });

  it('exposes methods', () => {
    const wrapper = mount(ExMenu, {
      global: {
        components: {
          ExMenuItem,
          ExSubMenu,
        },
      },
    });
    const vm = wrapper.vm as any;
    expect(vm.getActiveKey).toBeDefined();
    expect(vm.getOpenKeys).toBeDefined();
    expect(vm.setActiveKey).toBeDefined();
    expect(vm.setOpenKeys).toBeDefined();
    expect(vm.getElement).toBeDefined();
  });
});

describe('ExMenuItem', () => {
  it('renders correctly', () => {
    const wrapper = mount(ExMenuItem, {
      props: {
        itemKey: '1',
      },
      slots: {
        default: 'Menu Item',
      },
    });
    expect(wrapper.find('.ex-menu-item').exists()).toBe(true);
    expect(wrapper.text()).toContain('Menu Item');
  });

  it('renders with icon', () => {
    const wrapper = mount(ExMenuItem, {
      props: {
        itemKey: '1',
      },
      slots: {
        icon: '<img src="icon.svg" />',
        default: 'Menu Item',
      },
    });
    expect(wrapper.find('.ex-menu-item__icon').exists()).toBe(true);
  });

  it('applies disabled state', () => {
    const wrapper = mount(ExMenuItem, {
      props: {
        itemKey: '1',
        disabled: true,
      },
    });
    expect(wrapper.find('.ex-menu-item--disabled').exists()).toBe(true);
  });

  it('emits click event', async () => {
    const wrapper = mount(ExMenuItem, {
      props: {
        itemKey: '1',
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click when disabled', async () => {
    const wrapper = mount(ExMenuItem, {
      props: {
        itemKey: '1',
        disabled: true,
      },
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});

describe('ExSubMenu', () => {
  it('renders correctly', () => {
    const wrapper = mount(ExSubMenu, {
      props: {
        itemKey: 'sub1',
        title: 'Sub Menu',
      },
    });
    expect(wrapper.find('.ex-submenu').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sub Menu');
  });

  it('renders with icon', () => {
    const wrapper = mount(ExSubMenu, {
      props: {
        itemKey: 'sub1',
        title: 'Sub Menu',
      },
      slots: {
        icon: '<img src="icon.svg" />',
      },
    });
    expect(wrapper.find('.ex-submenu__icon').exists()).toBe(true);
  });

  it('toggles open state', async () => {
    const wrapper = mount(ExSubMenu, {
      props: {
        itemKey: 'sub1',
        title: 'Sub Menu',
      },
    });

    expect(wrapper.find('.ex-submenu--open').exists()).toBe(false);

    await wrapper.find('.ex-submenu__title').trigger('click');
    expect(wrapper.emitted('openChange')).toBeTruthy();
  });

  it('applies disabled state', () => {
    const wrapper = mount(ExSubMenu, {
      props: {
        itemKey: 'sub1',
        title: 'Sub Menu',
        disabled: true,
      },
    });
    expect(wrapper.find('.ex-submenu--disabled').exists()).toBe(true);
  });

  it('exposes methods', () => {
    const wrapper = mount(ExSubMenu, {
      props: {
        itemKey: 'sub1',
        title: 'Sub Menu',
      },
    });
    const vm = wrapper.vm as any;
    expect(vm.isOpen).toBeDefined();
    expect(vm.toggle).toBeDefined();
    expect(vm.open).toBeDefined();
    expect(vm.close).toBeDefined();
    expect(vm.getElement).toBeDefined();
  });
});

// Accessibility and keyboard/focus tests
describe('ExMenu a11y & keyboard', () => {
  it('horizontal menubar: ArrowRight/Left moves focus across top-level items', async () => {
    const wrapper = mount(ExMenu, {
      attachTo: document.body,
      props: { mode: 'horizontal' },
      slots: {
        default: `
          <ExMenuItem item-key="1">One</ExMenuItem>
          <ExMenuItem item-key="2">Two</ExMenuItem>
          <ExMenuItem item-key="3">Three</ExMenuItem>
        `,
      },
      global: {
        components: { ExMenuItem, ExSubMenu },
      },
    });

    const items = wrapper.findAll('.ex-menu__list > .ex-menu-item');
    expect(items.length).toBeGreaterThanOrEqual(3);

    (items[0].element as HTMLElement).focus();
    await items[0].trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).toBe(items[1].element);

    await items[1].trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(items[0].element);

    wrapper.unmount();
  });

  it('submenu: ArrowDown opens and focuses first item; Escape closes and returns focus', async () => {
    const wrapper = mount(ExMenu, {
      attachTo: document.body,
      props: { mode: 'horizontal' },
      slots: {
        default: `
          <ExSubMenu item-key="s1" title="More">
            <ExMenuItem item-key="a">A</ExMenuItem>
            <ExMenuItem item-key="b">B</ExMenuItem>
          </ExSubMenu>
        `,
      },
      global: {
        components: { ExMenuItem, ExSubMenu },
      },
    });

    const btn = wrapper.get('.ex-submenu__title');
    (btn.element as HTMLElement).focus();
    await btn.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    const listEl = document.querySelector('.ex-submenu__list') as HTMLElement | null;
    expect(listEl).toBeTruthy();
    expect((btn.element as HTMLButtonElement).getAttribute('aria-expanded')).toBe('true');

    const subItems = Array.from(document.querySelectorAll('.ex-submenu__list .ex-menu-item')) as HTMLElement[];
    expect(subItems.length).toBeGreaterThanOrEqual(1);
    expect(document.activeElement).toBe(subItems[0]);

    listEl!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await nextTick();
    expect((btn.element as HTMLButtonElement).getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn.element as HTMLElement);

    wrapper.unmount();
  });

  it('horizontal submenu: ArrowLeft on list closes submenu', async () => {
    const wrapper = mount(ExMenu, {
      attachTo: document.body,
      props: { mode: 'horizontal' },
      slots: {
        default: `
          <ExSubMenu item-key="s1" title="More">
            <ExMenuItem item-key="a">A</ExMenuItem>
            <ExMenuItem item-key="b">B</ExMenuItem>
          </ExSubMenu>
        `,
      },
      global: {
        components: { ExMenuItem, ExSubMenu },
      },
    });

    const btn = wrapper.get('.ex-submenu__title');
    (btn.element as HTMLElement).focus();
    await btn.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    const listEl = document.querySelector('.ex-submenu__list') as HTMLElement | null;
    expect(listEl).toBeTruthy();
    expect((btn.element as HTMLButtonElement).getAttribute('aria-expanded')).toBe('true');

    listEl!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    await nextTick();
    expect((btn.element as HTMLButtonElement).getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(btn.element as HTMLElement);

    wrapper.unmount();
  });

  it('uses role="menubar" in horizontal mode', () => {
    const wrapper = mount(ExMenu, {
      props: { mode: 'horizontal' },
    });
    expect(wrapper.get('.ex-menu__list').attributes('role')).toBe('menubar');
  });
});
