import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExEmpty from '../../../src/components/empty/ExEmpty.vue';
import ExIcon from '../../../src/components/icon/ExIcon.vue';
import ExList from '../../../src/components/list/ExList.vue';
import ExLoading from '../../../src/components/loading/ExLoading.vue';
import type { ExListExposed, ListItem, ListSize } from '../../../src/components/list/types';

const items: ListItem[] = [
  { key: 1, title: '第一项', description: '第一项说明', extra: '在线' },
  { key: 2, title: '第二项', description: '第二项说明' },
  { key: 3, title: '第三项', disabled: true },
];

describe('ExList', () => {
  it('默认使用原生列表语义，数据项不会伪装成交互控件', () => {
    const wrapper = mount(ExList, { props: { data: items } });
    const list = wrapper.get('ul.ex-list__items');
    const rows = wrapper.findAll('li.ex-list__item');

    expect(list.element.tagName).toBe('UL');
    expect(rows).toHaveLength(3);
    expect(rows[0]?.get('.ex-list__item-surface').element.tagName).toBe('DIV');
    expect(rows[0]?.attributes('role')).toBeUndefined();
    expect(rows[0]?.attributes('tabindex')).toBeUndefined();
    expect(wrapper.attributes('aria-busy')).toBe('false');
  });

  it('列表容器和列表项显式移除宿主样式注入的 marker', () => {
    const stylesheet = readFileSync(
      resolve(process.cwd(), 'src/components/list/ExList.scss'),
      'utf8'
    );

    expect(stylesheet).toMatch(/\.ex-list__items[\s\S]*?::marker\s*\{[\s\S]*?content:\s*['"]{2}/);
    expect(stylesheet).toMatch(/\.ex-list__item[\s\S]*?::marker\s*\{[\s\S]*?content:\s*['"]{2}/);
  });

  it('默认点击不发事件，clickable=true 时使用独立的原生主操作按钮', async () => {
    const passive = mount(ExList, { props: { data: items } });
    await passive.get('.ex-list__item-surface').trigger('click');
    expect(passive.emitted('item-click')).toBeUndefined();

    const interactive = mount(ExList, { props: { data: items, clickable: true } });
    const surface = interactive.findAll<HTMLElement>('.ex-list__item-surface')[0]!;
    const button = interactive.findAll<HTMLButtonElement>('.ex-list__item-primary-action')[0]!;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.element.dispatchEvent(event);

    expect(surface.element.tagName).toBe('DIV');
    expect(surface.attributes('role')).toBeUndefined();
    expect(button.element.tagName).toBe('BUTTON');
    expect(button.attributes('type')).toBe('button');
    expect(button.attributes('aria-label')).toBe('第一项');
    expect(interactive.emitted('item-click')?.[0]).toEqual([items[0], 0, event]);
  });

  it('禁用项与加载期间公开禁用语义且不发送事件', async () => {
    const wrapper = mount(ExList, { props: { data: items, clickable: true } });
    const buttons = wrapper.findAll<HTMLButtonElement>('.ex-list__item-primary-action');

    expect(buttons[2]?.attributes()).toHaveProperty('disabled');
    expect(wrapper.findAll('.ex-list__item')[2]?.attributes('aria-disabled')).toBe('true');
    await buttons[2]?.trigger('click');
    expect(wrapper.emitted('item-click')).toBeUndefined();

    await wrapper.setProps({ loading: true });
    expect(
      wrapper
        .findAll('.ex-list__item-primary-action')
        .every(button => Object.hasOwn(button.attributes(), 'disabled'))
    ).toBe(true);
    await wrapper.findAll('.ex-list__item-primary-action')[0]?.trigger('click');
    expect(wrapper.emitted('item-click')).toBeUndefined();
  });

  it.each<ListSize>(['small', 'medium', 'large'])('应用 %s 尺寸', size => {
    expect(mount(ExList, { props: { data: items, size } }).classes()).toContain(`ex-list--${size}`);
  });

  it('运行时非法尺寸回退为 medium', () => {
    const wrapper = mount(ExList, {
      props: { data: items, size: 'huge' as ListSize },
    });

    expect(wrapper.classes()).toContain('ex-list--medium');
    expect(wrapper.classes()).not.toContain('ex-list--huge');
  });

  it('接入 ConfigProvider 全局尺寸，显式尺寸优先', () => {
    const global = mount({
      components: { ExConfigProvider, ExList },
      setup: () => ({ items }),
      template: '<ExConfigProvider size="large"><ExList :data="items" /></ExConfigProvider>',
    });
    const explicit = mount({
      components: { ExConfigProvider, ExList },
      setup: () => ({ items }),
      template:
        '<ExConfigProvider size="large"><ExList :data="items" size="small" /></ExConfigProvider>',
    });

    expect(global.getComponent(ExList).classes()).toContain('ex-list--large');
    expect(explicit.getComponent(ExList).classes()).toContain('ex-list--small');
  });

  it('边框、分割线、悬停与网格状态使用独立类名', () => {
    const wrapper = mount(ExList, {
      props: {
        data: items,
        bordered: true,
        split: false,
        hoverable: true,
        grid: { column: 3 },
      },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-list--bordered', 'ex-list--hoverable', 'ex-list--grid'])
    );
    expect(wrapper.classes()).not.toContain('ex-list--split');
    expect(wrapper.get('.ex-list__items').classes()).toContain('ex-list__items--grid');
  });

  it('响应式 grid 配置写入完整断点变量并规范非法值', () => {
    const wrapper = mount(ExList, {
      props: {
        data: items,
        grid: {
          column: 3,
          gutter: 12.5,
          xs: 1,
          sm: 2,
          md: Number.NaN,
          lg: 4,
          xl: 40,
        },
      },
    });
    const style = wrapper.get('.ex-list__items').attributes('style');

    expect(style).toContain('--ex-list-grid-gutter: 12.5px');
    expect(style).toContain('--ex-list-grid-columns-xs: 1');
    expect(style).toContain('--ex-list-grid-columns-sm: 2');
    expect(style).toContain('--ex-list-grid-columns-md: 2');
    expect(style).toContain('--ex-list-grid-columns-lg: 4');
    expect(style).toContain('--ex-list-grid-columns-xl: 24');
    expect(style).toContain('--ex-list-grid-columns-xxl: 24');
  });

  it('内置标题、说明、额外信息、头像与图标按数据渲染', () => {
    const data: ListItem[] = [
      {
        key: 'avatar',
        title: '头像项',
        description: '说明',
        extra: '附加',
        avatar: '/avatar.png',
      },
      { key: 'icon', title: '图标项', icon: '/icon.svg' },
    ];
    const wrapper = mount(ExList, { props: { data } });

    const avatar = wrapper.get<HTMLImageElement>('.ex-list__item-avatar');
    expect(avatar.attributes('src')).toBe('/avatar.png');
    expect(avatar.attributes('alt')).toBe('');
    expect(avatar.attributes('draggable')).toBe('false');
    expect(wrapper.get('.ex-list__item-title').text()).toBe('头像项');
    expect(wrapper.get('.ex-list__item-description').text()).toBe('说明');
    expect(wrapper.get('.ex-list__item-extra').text()).toBe('附加');
    expect(wrapper.getComponent(ExIcon).props('src')).toBe('/icon.svg');
    expect(wrapper.getComponent(ExIcon).attributes('aria-hidden')).toBe('true');
  });

  it('局部插槽接收真实项和索引，item 插槽完整接管表面内容', () => {
    const partial = mount(ExList, {
      props: { data: items.slice(0, 1) },
      slots: {
        icon: '<template #icon="{ index }"><i class="slot-icon">{{ index }}</i></template>',
        title:
          '<template #title="{ item }"><strong class="slot-title">{{ item.title }}</strong></template>',
        description:
          '<template #description="{ item }"><span class="slot-description">{{ item.description }}</span></template>',
        extra:
          '<template #extra="{ index }"><span class="slot-extra">#{{ index }}</span></template>',
      },
    });
    const whole = mount(ExList, {
      props: { data: items.slice(0, 1) },
      slots: {
        item: '<template #item="{ item, index }"><article class="whole-item">{{ index }}-{{ item.title }}</article></template>',
      },
    });

    expect(partial.get('.slot-icon').text()).toBe('0');
    expect(partial.get('.slot-title').text()).toBe('第一项');
    expect(partial.get('.slot-description').text()).toBe('第一项说明');
    expect(partial.get('.slot-extra').text()).toBe('#0');
    expect(whole.get('.whole-item').text()).toBe('0-第一项');
    expect(whole.find('.ex-list__item-content').exists()).toBe(false);
  });

  it('空数据复用 ExEmpty，支持显式空文案和完整空态插槽', () => {
    const defaults = mount(ExList, { props: { data: [], emptyText: '没有记录' } });
    const hiddenText = mount(ExList, { props: { data: [], emptyText: '' } });
    const custom = mount(ExList, {
      props: { data: [] },
      slots: { empty: '<section class="custom-empty">自定义空态</section>' },
    });

    expect(defaults.getComponent(ExEmpty).props('description')).toBe('没有记录');
    expect(defaults.text()).toContain('没有记录');
    expect(hiddenText.find('.ex-empty__description').exists()).toBe(false);
    expect(custom.get('.custom-empty').text()).toBe('自定义空态');
    expect(custom.findComponent(ExEmpty).exists()).toBe(false);
  });

  it('加载态复用 ExLoading、隐藏空态并隔离现有内容交互', () => {
    const withData = mount(ExList, {
      props: { data: items, loading: true, loadingText: '刷新列表', clickable: true },
    });
    const empty = mount(ExList, { props: { data: [], loading: true } });

    expect(withData.attributes('aria-busy')).toBe('true');
    expect(withData.classes()).toContain('ex-list--loading');
    expect(withData.get('.ex-list__items').attributes('inert')).toBe('true');
    expect(withData.getComponent(ExLoading).props()).toEqual(
      expect.objectContaining({ visible: true, fullscreen: false, mask: true, text: '刷新列表' })
    );
    expect(empty.classes()).toContain('ex-list--loading-empty');
    expect(empty.findComponent(ExEmpty).exists()).toBe(false);
    expect(empty.find('.ex-list__empty').exists()).toBe(false);
  });

  it('原生 class、style、aria 与 data 属性透传，删除的虚拟滚动属性不泄漏', () => {
    const wrapper = mount(ExList, {
      props: { data: items },
      attrs: {
        class: 'custom-list',
        style: { maxWidth: '480px' },
        'aria-label': '服务器列表',
        'data-track-id': 'servers',
        virtual: true,
        'item-height': 64,
        height: 400,
      },
    });

    expect(wrapper.classes()).toContain('custom-list');
    expect(wrapper.attributes('style')).toContain('max-width: 480px');
    expect(wrapper.attributes('aria-label')).toBe('服务器列表');
    expect(wrapper.attributes('data-track-id')).toBe('servers');
    expect(wrapper.attributes('virtual')).toBeUndefined();
    expect(wrapper.attributes('item-height')).toBeUndefined();
    expect(wrapper.attributes('height')).toBeUndefined();
  });

  it('缺少 itemKey 时使用对象身份保持重排 DOM 稳定', async () => {
    const first: ListItem = { title: 'A' };
    const second: ListItem = { title: 'B' };
    const wrapper = mount(ExList, {
      props: { data: [first, second] },
      slots: {
        item: '<template #item="{ item }"><span :data-title="item.title">{{ item.title }}</span></template>',
      },
    });
    const before = wrapper.get('[data-title="A"]').element.closest('.ex-list__item');

    await wrapper.setProps({ data: [second, first] });
    const after = wrapper.get('[data-title="A"]').element.closest('.ex-list__item');

    expect(after).toBe(before);
  });

  it('重复显式 key 回退到对象身份，避免错误复用列表项', async () => {
    const first: ListItem = { key: 'duplicate', title: 'A' };
    const second: ListItem = { key: 'duplicate', title: 'B' };
    const wrapper = mount(ExList, {
      props: { data: [first, second] },
      slots: {
        item: '<template #item="{ item }"><span :data-title="item.title">{{ item.title }}</span></template>',
      },
    });
    const firstNode = wrapper.get('[data-title="A"]').element.closest('.ex-list__item');
    const secondNode = wrapper.get('[data-title="B"]').element.closest('.ex-list__item');

    await wrapper.setProps({ data: [second, first] });
    expect(wrapper.get('[data-title="A"]').element.closest('.ex-list__item')).toBe(firstNode);
    expect(wrapper.get('[data-title="B"]').element.closest('.ex-list__item')).toBe(secondNode);
  });

  it('itemKey 函数控制唯一键且事件索引随当前数据更新', async () => {
    const data: ListItem[] = [
      { id: 'a', title: 'A' },
      { id: 'b', title: 'B' },
    ];
    const wrapper = mount(ExList, {
      props: {
        data,
        clickable: true,
        itemKey: item => item.id as string,
      },
    });

    await wrapper.findAll('.ex-list__item-primary-action')[1]?.trigger('click');
    expect(wrapper.emitted('item-click')?.[0]?.slice(0, 2)).toEqual([data[1], 1]);
  });

  it('主操作按钮与插槽交互控件保持同级且内部操作不冒泡为 item-click', async () => {
    const wrapper = mount(ExList, {
      props: { data: items.slice(0, 1), clickable: true },
      slots: {
        item: '<template #item><button class="inner-action">Action</button></template>',
      },
    });
    const primaryAction = wrapper.get('.ex-list__item-primary-action');
    const innerAction = wrapper.get('.inner-action');

    expect(primaryAction.element.tagName).toBe('BUTTON');
    expect(innerAction.element.tagName).toBe('BUTTON');
    expect(primaryAction.element.contains(innerAction.element)).toBe(false);
    await innerAction.trigger('click');
    expect(wrapper.emitted('item-click')).toBeUndefined();

    await primaryAction.trigger('click');
    expect(wrapper.emitted('item-click')).toHaveLength(1);
  });

  it('暴露真实根元素', () => {
    const wrapper = mount(ExList, { props: { data: items } });
    const exposed = wrapper.vm as unknown as ExListExposed;

    expect(exposed.getElement()).toBe(wrapper.element);
  });
});
