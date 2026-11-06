import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import { afterEach, expect, it, vi } from 'vitest';
import { parse } from '@vue/compiler-sfc';
import { readFileSync } from 'node:fs';
import Affix from '../../src/components/affix/ExAffix.vue';
import Anchor from '../../src/components/anchor/ExAnchor.vue';
import AnchorLink from '../../src/components/anchor/ExAnchorLink.vue';
import BackTop from '../../src/components/back-top/ExBackTop.vue';
import Collapse from '../../src/components/collapse/ExCollapse.vue';
import CollapseItem from '../../src/components/collapse/ExCollapseItem.vue';
import Config from '../../src/components/config-provider/ExConfigProvider.vue';
import Pagination from '../../src/components/pagination/ExPagination.vue';
import { normalizeLoadingBarHeight } from '../../src/components/loading-bar/loading-bar-utils';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});
const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};
const rect = (height: number) =>
  ({ top: -10, bottom: height - 10, left: 0, right: 100, width: 100, height }) as DOMRect;

it('Affix 固定后占位高度跟随真实内容变化', async () => {
  const wrapper = mount(Affix, {
    props: { offsetTop: 0 },
    slots: { default: () => h('div', '内容') },
  });
  await flush();
  vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(rect(40));
  vi.spyOn(wrapper.get('.ex-affix__content').element, 'getBoundingClientRect').mockReturnValue(
    rect(80)
  );
  wrapper.vm.updatePosition();
  await flush();
  expect(wrapper.attributes('style')).toContain('height: 80px');
});

it('Affix 固定后响应 Provider 层级变化', async () => {
  const wrapper = mount(Config, {
    props: { zIndex: 2000 },
    slots: { default: () => h(Affix, { offsetTop: 0 }) },
  });
  await flush();
  await wrapper.setProps({ zIndex: 3000 });
  expect(wrapper.get('.ex-affix__content').attributes('style')).toContain('3020');
});

it('Anchor 点击新的锚点发出一次 change', async () => {
  const target = document.createElement('div');
  target.id = 'target';
  document.body.append(target);
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({ ...rect(100), top: 400 });
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const wrapper = mount(Anchor, {
    slots: { default: () => h(AnchorLink, { href: '#target', title: '目标' }) },
  });
  await wrapper.get('a').trigger('click');
  expect(wrapper.emitted('change')).toEqual([['#target']]);
});

it('BackTop 的 Teleport 保留 Provider 品牌覆盖', async () => {
  const wrapper = mount(Config, {
    props: { themeOverrides: { '--ex-color-primary': 'red' } },
    slots: { default: () => h(BackTop) },
  });
  wrapper.findComponent(BackTop).vm.show();
  await flush();
  expect(
    document
      .querySelector<HTMLElement>('.ex-back-top')!
      .style.getPropertyValue('--ex-color-primary')
  ).toBe('red');
});

it('Breadcrumb SFC 引入列表布局样式', () => {
  const { descriptor } = parse(readFileSync('src/components/breadcrumb/ExBreadcrumb.vue', 'utf8'));
  expect(descriptor.styles.some(style => style.src?.endsWith('ExBreadcrumb.scss'))).toBe(true);
});

it('Collapse 接收原地修改的受控数组', async () => {
  const active = ref<string[]>([]);
  const wrapper = mount(Collapse, {
    props: { modelValue: active.value },
    slots: { default: () => h(CollapseItem, { name: 'a', title: 'A' }) },
  });
  active.value.push('a');
  await flush();
  expect(wrapper.get('button').attributes('aria-expanded')).toBe('true');
});

it('Pagination 的按钮不会提交外部表单', async () => {
  const submit = vi.fn((event: Event) => event.preventDefault());
  const wrapper = mount(
    { render: () => h('form', { onSubmit: submit }, h(Pagination, { total: 100 })) },
    { attachTo: document.body }
  );
  (wrapper.get('.ex-pagination__next').element as HTMLButtonElement).click();
  await flush();
  expect(submit).not.toHaveBeenCalled();
});

it('Pagination 改变容量时保留第一条数据位置', async () => {
  const wrapper = mount(Pagination, {
    props: { total: 100, current: 10, pageSize: 10, showSizeChanger: true },
  });
  await wrapper.get('select').setValue('20');
  expect(wrapper.emitted('change')?.at(-1)).toEqual([5, 20]);
});

it('Pagination 正小数容量不产生无限页数', () => {
  const wrapper = mount(Pagination, { props: { total: 100, pageSize: 0.5, simple: true } });
  expect(wrapper.text()).not.toContain('Infinity');
});

it('LoadingBar 高度遵守至少 1px 的契约', () => {
  expect(normalizeLoadingBarHeight(0.2)).toBeGreaterThanOrEqual(1);
});
