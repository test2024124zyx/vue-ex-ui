import { describe, it, expect, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { TreeSelectNode } from '../../../src/components/tree-select/types';

const data: TreeSelectNode[] = [
  {
    value: '1',
    label: 'P1',
    children: [
      { value: '1-1', label: 'C1' },
      { value: '1-2', label: 'C2' },
    ],
  },
  { value: '2', label: 'P2' },
];

describe('ExTreeSelect', () => {
  let wrapper: ReturnType<typeof mount> | null = null;
  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  const mountTS = (props = {}) => {
    wrapper = mount(ExTreeSelect, { props: { data, ...props }, attachTo: document.body });
    return wrapper;
  };

  it('未选择显示占位', () => {
    mountTS({ placeholder: '请选择' });
    expect(wrapper!.find('.ex-tree-select__placeholder').text()).toBe('请选择');
  });

  it('单选：点击节点选中并关闭', async () => {
    mountTS({ defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('1');
    expect(wrapper!.emitted('visible-change')!.at(-1)![0]).toBe(false);
  });

  it('多选级联：勾选父节点连带子节点', async () => {
    mountTS({ multiple: true, modelValue: [], defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1 -> cascade
    await nextTick();
    const value = wrapper!.emitted('update:modelValue')!.at(-1)![0] as string[];
    expect(value).toContain('1');
    expect(value).toContain('1-1');
    expect(value).toContain('1-2');
    expect(value.length).toBe(3);
  });

  it('check-strictly：父子互不关联', async () => {
    mountTS({ multiple: true, checkStrictly: true, modelValue: [], defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const nodes = document.querySelectorAll<HTMLElement>('.ex-tree-select__node');
    nodes[0]!.click(); // P1 only
    await nextTick();
    const value = wrapper!.emitted('update:modelValue')!.at(-1)![0] as string[];
    expect(value).toEqual(['1']);
  });

  it('可搜索过滤节点', async () => {
    mountTS({ filterable: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const input = document.querySelector<HTMLInputElement>('.ex-tree-select__search-input')!;
    input.value = 'C1';
    input.dispatchEvent(new Event('input'));
    await nextTick();
    const labels = Array.from(document.querySelectorAll('.ex-tree-select__node-label')).map(
      el => el.textContent
    );
    expect(labels).toContain('C1');
    expect(labels).toContain('P1'); // 祖先路径保留
    expect(labels).not.toContain('C2');
    expect(labels).not.toContain('P2');
  });

  it('清空触发 clear', async () => {
    mountTS({ modelValue: '1', clearable: true });
    expect(wrapper!.find('.ex-tree-select__clear').element.tagName).toBe('BUTTON');
    await wrapper!.find('.ex-tree-select__clear').trigger('click');
    expect(wrapper!.emitted('clear')).toBeTruthy();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBeNull();
  });

  it('tree items expose focus and keyboard selection semantics', async () => {
    mountTS({ defaultExpandAll: true });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();

    const firstNode = document.querySelector<HTMLElement>('.ex-tree-select__node')!;
    expect(firstNode.getAttribute('role')).toBe('treeitem');
    expect(firstNode.getAttribute('tabindex')).toBe('0');
    expect(firstNode.getAttribute('aria-level')).toBe('1');

    firstNode.focus();
    firstNode.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await nextTick();
    expect(wrapper!.emitted('update:modelValue')!.at(-1)![0]).toBe('1');
  });

  it('组合框应该可命名，树节点只保留一个漫游式 Tab 停靠点', async () => {
    mountTS({
      defaultExpandAll: true,
      id: 'category-select',
      ariaLabel: '分类',
      ariaDescribedby: 'category-help',
    });
    const trigger = wrapper!.find('.ex-tree-select__trigger');
    expect(trigger.attributes('id')).toBe('category-select');
    expect(trigger.attributes('aria-label')).toBe('分类');
    expect(trigger.attributes('aria-describedby')).toBe('category-help');

    await trigger.trigger('click');
    await nextTick();
    const controlsId = trigger.attributes('aria-controls');
    expect(controlsId).toBeDefined();
    const controlledTree = document.getElementById(controlsId!);
    expect(controlledTree?.getAttribute('role')).toBe('tree');
    expect(controlledTree?.getAttribute('aria-label')).toBe('分类');
    const tabStops = Array.from(document.querySelectorAll('[role="treeitem"]')).filter(
      item => item.getAttribute('tabindex') === '0'
    );
    expect(tabStops).toHaveLength(1);
  });

  it('树弹层支持使用外部标签元素命名', async () => {
    mountTS({ ariaLabelledby: 'category-label' });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();

    const tree = document.querySelector<HTMLElement>('[role="tree"]')!;
    expect(tree.getAttribute('aria-labelledby')).toBe('category-label');
    expect(tree.hasAttribute('aria-label')).toBe(false);
  });

  it('方向键应该跳过禁用节点', async () => {
    mountTS({
      data: [
        { value: 'disabled-first', label: 'Disabled first', disabled: true },
        { value: 'first', label: 'First' },
        { value: 'disabled', label: 'Disabled', disabled: true },
        { value: 'last', label: 'Last' },
        { value: 'disabled-last', label: 'Disabled last', disabled: true },
      ],
    });
    await wrapper!.find('.ex-tree-select__trigger').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    expect(document.activeElement?.classList.contains('ex-tree-select__node')).toBe(true);
    expect(document.activeElement?.textContent).toContain('First');

    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    );
    await nextTick();

    expect(document.activeElement?.classList.contains('ex-tree-select__node')).toBe(true);
    expect(document.activeElement?.textContent).toContain('Last');

    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true })
    );
    await nextTick();
    expect(document.activeElement?.textContent).toContain('First');

    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
    );
    await nextTick();
    expect(document.activeElement?.textContent).toContain('Last');
  });

  it('运行时禁用应该关闭面板并阻止节点更新', async () => {
    mountTS();
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const node = document.querySelector<HTMLElement>('.ex-tree-select__node')!;

    await wrapper!.setProps({ disabled: true });
    node.click();
    await nextTick();

    expect(document.querySelector('.ex-tree-select__panel')).toBeNull();
    expect(wrapper!.emitted('update:modelValue')).toBeUndefined();
  });

  it('级联选择不应该加入禁用祖先', async () => {
    mountTS({
      data: [
        {
          value: 'disabled-parent',
          label: 'Disabled parent',
          disabled: true,
          children: [{ value: 'child', label: 'Child' }],
        },
      ],
      multiple: true,
      modelValue: [],
      filterable: true,
    });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const search = document.querySelector<HTMLInputElement>('.ex-tree-select__search-input')!;
    search.value = 'Child';
    search.dispatchEvent(new Event('input'));
    await nextTick();

    document.querySelectorAll<HTMLElement>('.ex-tree-select__node')[1]!.click();
    await nextTick();

    expect(wrapper!.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['child']);
  });

  it('禁用节点的展开箭头不应该改变展开状态', async () => {
    mountTS({
      data: [
        {
          value: 'disabled-parent',
          label: 'Disabled parent',
          disabled: true,
          children: [{ value: 'child', label: 'Child' }],
        },
      ],
    });
    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();

    document.querySelector<HTMLElement>('.ex-tree-select__expand')!.click();
    await nextTick();

    expect(wrapper!.emitted('expand')).toBeUndefined();
    expect(document.querySelectorAll('.ex-tree-select__node')).toHaveLength(1);
  });

  it('传送面板应该限制在视口横向范围内', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 900,
      right: 1000,
      top: 20,
      bottom: 52,
      width: 100,
      height: 32,
      x: 900,
      y: 20,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
    mountTS();

    await wrapper!.find('.ex-tree-select__trigger').trigger('click');
    await nextTick();

    expect(document.querySelector<HTMLElement>('.ex-tree-select__panel')!.style.left).toBe('696px');
  });

  it('Teleport 面板继承 ConfigProvider 的语义层级和效果开关', async () => {
    const provider = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExTreeSelect, { data }) },
    });

    await provider.get('.ex-tree-select__trigger').trigger('click');
    await nextTick();
    const panel = document.querySelector<HTMLElement>('.ex-tree-select__panel')!;
    expect(panel.style.zIndex).toBe('2400');
    expect(panel.classList).toContain('ex-no-neon');
    expect(panel.classList).toContain('ex-no-animation');
    provider.unmount();
  });
});
