import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import type { Component } from 'vue';
import ExAvatar from '../../src/components/avatar/ExAvatar.vue';
import ExAvatarGroup from '../../src/components/avatar/ExAvatarGroup.vue';
import ExBadge from '../../src/components/badge/ExBadge.vue';
import ExButton from '../../src/components/button/ExButton.vue';
import ExCard from '../../src/components/card/ExCard.vue';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import ExDescriptions from '../../src/components/descriptions/ExDescriptions.vue';
import ExDescriptionsItem from '../../src/components/descriptions/ExDescriptionsItem.vue';
import ExDivider from '../../src/components/divider/ExDivider.vue';
import ExEmpty from '../../src/components/empty/ExEmpty.vue';
import ExIcon from '../../src/components/icon/ExIcon.vue';
import ExList from '../../src/components/list/ExList.vue';
import ExPanel from '../../src/components/panel/ExPanel.vue';
import ExSkeleton from '../../src/components/skeleton/ExSkeleton.vue';
import { createLocaleProvider, setLocale, useI18n } from '../../src/locale';

enableAutoUnmount(afterEach);
afterEach(() => setLocale('en-US'));

describe('基础组件源码验收回归', () => {
  it.each([
    ['Badge', ExBadge, 'default'],
    ['Divider', ExDivider, 'default'],
    ['Empty', ExEmpty, 'default'],
    ['Icon', ExIcon, 'default'],
    ['Avatar', ExAvatar, 'icon'],
    ['Panel', ExPanel, 'title'],
  ] as const)('%s 响应父级在渲染阶段创建的新插槽', async (_name, component, slot) => {
    const shown = ref(false);
    const wrapper = mount(
      defineComponent(() => () => {
        // 在父级读取依赖，插槽闭包只持有本次渲染的快照。
        const content = shown.value ? [h('span', { class: 'new-content' }, '新内容')] : [];
        return h(component as Component, {}, { [slot]: () => content });
      })
    );
    expect(wrapper.find('.new-content').exists()).toBe(false);
    shown.value = true;
    await nextTick();
    expect(wrapper.find('.new-content').exists()).toBe(true);
    shown.value = false;
    await nextTick();
    expect(wrapper.find('.new-content').exists()).toBe(false);
  });

  it('圆形按钮名称和显示文字同步更新', async () => {
    const label = ref('旧名称');
    const wrapper = mount(
      defineComponent(() => () => {
        const snapshot = label.value;
        return h(ExButton, { shape: 'circle' }, () => snapshot);
      })
    );
    label.value = '新名称';
    await nextTick();
    expect(wrapper.get('button').attributes('aria-label')).toBe('新名称');
    expect(wrapper.text()).toBe('新');
  });

  it('头像组更新插槽数量与溢出数量', async () => {
    const count = ref(1);
    const wrapper = mount(
      defineComponent(() => () => {
        const avatars = Array.from({ length: count.value }, (_, key) =>
          h(ExAvatar, { key, text: String(key) })
        );
        return h(ExAvatarGroup, { maxCount: 2 }, () => avatars);
      })
    );
    count.value = 3;
    await nextTick();
    expect(wrapper.findAll('.ex-avatar')).toHaveLength(3);
    expect(wrapper.get('.ex-avatar-group__overflow').text()).toBe('+1');
  });

  it('头像修改候选图片后可以从错误状态恢复', async () => {
    const wrapper = mount(ExAvatar, { props: { src: '/fallback.png', srcset: '/old.png 2x' } });
    await wrapper.get('img').trigger('error');
    await wrapper.setProps({ srcset: '/new.png 2x' });
    expect(wrapper.get('img').attributes('srcset')).toBe('/new.png 2x');
  });

  it('Descriptions 同步插槽标签和内容快照并遵守原生跨度上限', async () => {
    const text = ref('旧');
    const wrapper = mount(
      defineComponent(() => () => {
        const snapshot = text.value;
        return h(ExDescriptions, { column: 1000 }, () =>
          h(ExDescriptionsItem, { label: snapshot }, () => snapshot)
        );
      })
    );
    text.value = '新';
    await nextTick();
    expect(wrapper.text()).toContain('新');
    expect(wrapper.text()).not.toContain('旧');
    for (const cell of wrapper.findAll('td, th')) {
      const span = Number(cell.attributes('colspan'));
      expect(span).toBe((cell.element as HTMLTableCellElement).colSpan);
    }
  });

  it.each([
    ['Card', ExCard],
    ['Panel', ExPanel],
  ] as const)('%s 动态接入点击处理并继承尺寸', async (_name, component) => {
    const clickable = ref(false);
    const onClick = vi.fn();
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(
            ExConfigProvider,
            { size: 'large' },
            {
              default: () =>
                h(component as Component, {
                  hoverable: true,
                  ...(clickable.value ? { onClick } : {}),
                }),
            }
          )
      )
    );
    clickable.value = true;
    await nextTick();
    const target = wrapper.findComponent(component);
    expect(target.classes()).toContain(_name === 'Card' ? 'ex-card--large' : 'ex-panel--large');
    if (_name === 'Card') expect(target.classes()).toContain('ex-card--clickable');
    else expect(target.attributes('tabindex')).toBe('0');
  });

  it('List 转发后续新增的原生属性', async () => {
    const labelled = ref(false);
    const wrapper = mount(
      defineComponent(() => () => h(ExList, labelled.value ? { 'aria-label': '记录' } : {}))
    );
    labelled.value = true;
    await nextTick();
    expect(wrapper.get('.ex-list').attributes('aria-label')).toBe('记录');
  });

  it('Panel 不拦截内部输入，加载期间不执行键盘操作', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExPanel, {
      props: { hoverable: true, onClick },
      slots: { default: '<input />' },
    });
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    wrapper.get('input').element.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    await wrapper.setProps({ loading: true });
    await wrapper.get('.ex-panel').trigger('keydown', { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('Skeleton 规范化重复数量，保留零行与尺寸样式', () => {
    const wrapper = mount(ExSkeleton, {
      props: { count: 1.5, rows: 0, variant: 'paragraph', width: 123, style: 'color: red' },
    });
    expect(wrapper.findAll('.ex-skeleton__repeat')).toHaveLength(1);
    expect(wrapper.findAll('.ex-skeleton__row')).toHaveLength(0);
    expect(wrapper.get('.ex-skeleton').attributes('style')).toContain('width: 123px');
  });

  it('Provider 不覆盖全局或 App 的语言，最近层语言被 useI18n 消费', async () => {
    const Probe = defineComponent(() => {
      const { t } = useI18n();
      return () => h('span', t('common.loading'));
    });
    setLocale('zh-CN');
    const global = mount(ExConfigProvider, { slots: { default: () => h(Probe) } });
    expect(global.text()).toBe('加载中...');
    setLocale('en-US');
    await nextTick();
    expect(global.text()).toBe('Loading...');
    const app = mount(ExConfigProvider, {
      global: { plugins: [createLocaleProvider({ locale: 'zh-CN' })] },
      slots: { default: () => h(Probe) },
    });
    expect(app.text()).toBe('加载中...');
    await app.setProps({ locale: 'en-US' });
    expect(app.text()).toBe('Loading...');
  });

  it('嵌套 Provider 显式重置默认层级时覆盖外层变量', () => {
    const wrapper = mount(ExConfigProvider, {
      props: { zIndex: 3000 },
      slots: {
        default: () => h(ExConfigProvider, { zIndex: 1000 }),
      },
    });
    expect(wrapper.findAll('.ex-config-provider')[1]!.attributes('style')).toContain(
      '--ex-z-modal: 1050'
    );
  });
});
