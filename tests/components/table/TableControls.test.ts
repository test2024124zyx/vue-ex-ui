import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExTableEditCell from '../../../src/components/table/ExTableEditCell.vue';
import ExTableColumnControls from '../../../src/components/table/ExTableColumnControls.vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { TableColumn } from '../../../src/components/table/types';
import {
  TABLE_COLUMN_DRAG_TYPE,
  TABLE_COLUMN_KEYBOARD_STEP,
  TABLE_MIN_COLUMN_WIDTH,
} from '../../../src/components/table/use-table-column-interactions';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const COLUMN: TableColumn = { key: 'amount', title: '金额' };

describe('表格编辑单元格的输入和错误语义', () => {
  it('文本原样提交，null 和 undefined 显示为空，非字符串值可回显', async () => {
    const wrapper = mount(ExTableEditCell, { props: { column: COLUMN, value: null } });
    const input = wrapper.get('input');
    expect(input.element.value).toBe('');
    await input.setValue('完整的业务内容');
    expect(wrapper.emitted('update:value')).toEqual([['完整的业务内容']]);
    await wrapper.setProps({ value: '完整的业务内容' });
    await wrapper.setProps({ value: undefined });
    expect(input.element.value).toBe('');
    await wrapper.setProps({ value: 12 });
    expect(input.element.value).toBe('12');
    expect(wrapper.props('value')).toBe(12);
  });

  it('数值输入允许小数与负数，清空明确提交 null', async () => {
    const wrapper = mount(ExTableEditCell, {
      props: { column: { ...COLUMN, editor: 'number' }, value: 10 },
    });
    const input = wrapper.get('input');
    expect(input.attributes('type')).toBe('number');
    await input.setValue('-12.5');
    await input.setValue('0');
    await input.setValue('');
    expect(wrapper.emitted('update:value')).toEqual([[-12.5], [0], [null]]);
  });

  it('底层输入控件传来无法解析或非有限数值时不污染行草稿', () => {
    const wrapper = mount(ExTableEditCell, {
      props: { column: { ...COLUMN, editor: 'number' }, value: 10 },
    });
    const input = wrapper.getComponent(ExInput);
    for (const value of ['invalid', 'Infinity', Number.NaN, Number.POSITIVE_INFINITY]) {
      input.vm.$emit('update:modelValue', value);
    }
    expect(wrapper.emitted('update:value')).toBeUndefined();
  });

  it('复选编辑只把布尔 true 映射为选中，切换提交布尔值', async () => {
    const wrapper = mount(ExTableEditCell, {
      props: { column: { ...COLUMN, editor: 'checkbox' }, value: 'true' },
    });
    const input = wrapper.get<HTMLInputElement>('input[type="checkbox"]');
    expect(input.element.checked).toBe(false);
    await input.setValue(true);
    expect(wrapper.emitted('update:value')?.[0]).toEqual([true]);
    await wrapper.setProps({ value: true });
    expect(input.element.checked).toBe(true);
    await input.setValue(false);
    expect(wrapper.emitted('update:value')?.[1]).toEqual([false]);
  });

  it('选择编辑只接受字符串或数字作为回显值，沿用 Select 的受控选项契约', async () => {
    const options = [
      { value: 0, label: '零' },
      { value: 'a', label: '甲' },
    ];
    const wrapper = mount(ExTableEditCell, {
      props: { column: { ...COLUMN, editor: 'select', editorOptions: options }, value: false },
    });
    const select = wrapper.getComponent(ExSelect);
    expect(select.props('modelValue')).toBeNull();
    await wrapper.setProps({ value: 0 });
    expect(select.props('modelValue')).toBe(0);
    await select.get('.ex-select__trigger').trigger('click');
    document.querySelectorAll<HTMLElement>('[role="option"]')[1]!.click();
    expect(wrapper.emitted('update:value')).toEqual([['a']]);
    expect(select.props('modelValue')).toBe(0);
    await wrapper.setProps({ value: 'a' });
    expect(select.props('modelValue')).toBe('a');
  });

  it('未提供选择项时展示空选择器，列标题为空时仍有包含字段名的名称', async () => {
    const wrapper = mount(ExTableEditCell, {
      props: { column: { key: 'department', editor: 'select' }, value: {} },
    });
    const select = wrapper.getComponent(ExSelect);
    expect(select.props('options')).toEqual([]);
    expect(select.get('[role="combobox"]').attributes('aria-label')).toContain('department');
    await select.get('.ex-select__trigger').trigger('click');
    expect(document.querySelector('.ex-select__empty')).not.toBeNull();
  });

  it.each(['text', 'number', 'checkbox', 'select'] as const)(
    '%s 编辑控件关联唯一错误描述，恢复后移除错误语义',
    async editor => {
      const wrapper = mount(ExTableEditCell, {
        props: { column: { ...COLUMN, editor }, value: null, error: '值不符合业务规则' },
      });
      const control = wrapper.get(editor === 'select' ? '[role="combobox"]' : 'input');
      const error = wrapper.get('[role="alert"]');
      expect(control.attributes('aria-invalid')).toBe('true');
      expect(control.attributes('aria-describedby')).toBe(error.attributes('id'));
      expect(control.attributes('aria-label')).toContain(COLUMN.title);
      expect(error.text()).toBe('值不符合业务规则');
      const pair = mount({
        render: () =>
          h('div', [
            h(ExTableEditCell, { column: { ...COLUMN, editor }, value: null, error: '第一行' }),
            h(ExTableEditCell, { column: { ...COLUMN, editor }, value: null, error: '第二行' }),
          ]),
      });
      expect(new Set(pair.findAll('[role="alert"]').map(node => node.attributes('id'))).size).toBe(
        2
      );
      await wrapper.setProps({ error: undefined });
      expect(wrapper.find('[role="alert"]').exists()).toBe(false);
      expect(control.attributes('aria-describedby')).toBeUndefined();
      expect(control.attributes('aria-invalid')).not.toBe('true');
    }
  );

  it.each(['text', 'checkbox', 'select'] as const)('%s 禁用状态阻止直接用户更改', async editor => {
    const wrapper = mount(ExTableEditCell, {
      props: { column: { ...COLUMN, editor }, value: null, disabled: true },
    });
    if (editor === 'select') {
      const trigger = wrapper.get('[role="combobox"]');
      expect(trigger.attributes('aria-disabled')).toBe('true');
      await trigger.trigger('click');
      expect(document.querySelector('.ex-select__dropdown')).toBeNull();
    } else {
      expect(wrapper.get<HTMLInputElement>('input').element.disabled).toBe(true);
      await wrapper.get('input').trigger('input');
    }
    expect(wrapper.emitted('update:value')).toBeUndefined();
  });

  it('Escape 取消编辑且阻止冒泡，其他键不影响编辑状态', async () => {
    const wrapper = mount(ExTableEditCell, { props: { column: COLUMN, value: '' } });
    await wrapper.get('input').trigger('keydown', { key: 'Escape' });
    const escape = wrapper.getComponent(ExInput).emitted('keydown')![0]![0] as KeyboardEvent;
    expect(escape.defaultPrevented).toBe(true);
    expect(wrapper.emitted('cancel')).toEqual([[]]);
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });

  it.each([
    { isComposing: true, keyCode: 0 },
    { isComposing: false, keyCode: 229 },
  ])('输入法候选关闭键不会取消整行编辑：%j', async composition => {
    const wrapper = mount(ExTableEditCell, { props: { column: COLUMN, value: '' } });
    await wrapper.get('input').trigger('keydown', { key: 'Escape', ...composition });
    expect(wrapper.emitted('cancel')).toBeUndefined();
  });
});

interface ControlProps {
  column: TableColumn;
  width?: number | string;
  resizable?: boolean;
  reorderable?: boolean;
  resizing?: boolean;
  disabled?: boolean;
}

function mountControls(props: Partial<ControlProps> = {}, direction = 'ltr') {
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th></th></tr></thead>';
  document.body.append(table);
  const header = table.querySelector('th')!;
  header.style.direction = direction;
  vi.spyOn(header, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 120, 40));
  const wrapper = mount(ExTableColumnControls, {
    props: { column: COLUMN, resizable: true, reorderable: true, ...props },
    attachTo: header,
  });
  return { wrapper, header };
}

function transferData(source = '') {
  const values = new Map([[TABLE_COLUMN_DRAG_TYPE, source]]);
  return {
    effectAllowed: 'none',
    dropEffect: 'none',
    setData: vi.fn((type: string, value: string) => values.set(type, value)),
    getData: vi.fn((type: string) => values.get(type) ?? ''),
  };
}

describe('表头列宽和排序控件的原生交互', () => {
  it('未开启能力时没有交互控件，开启后状态和可访问名称完整', () => {
    const empty = mount(ExTableColumnControls, { props: { column: COLUMN } });
    expect(empty.findAll('button')).toHaveLength(0);
    expect(empty.find('[role="separator"]').exists()).toBe(false);
    const { wrapper } = mountControls({ resizing: true });
    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes('aria-orientation')).toBe('vertical');
    expect(separator.attributes('tabindex')).toBe('0');
    expect(separator.classes()).toContain('ex-table-column-controls__resize--active');
    expect(separator.attributes('aria-label')).toContain(COLUMN.title);
    expect(wrapper.findAll('button').every(button => button.attributes('aria-label'))).toBe(true);
  });

  it('pointerdown 传递原事件、列和真实 th，无所属表头时不启动拖动', async () => {
    const { wrapper, header } = mountControls();
    const separator = wrapper.get('[role="separator"]');
    const pointer = new MouseEvent('pointerdown', { clientX: 50, button: 0, bubbles: true });
    Object.defineProperty(pointer, 'pointerId', { value: 7 });
    separator.element.dispatchEvent(pointer);
    const [event, column, element] = wrapper.emitted('resize-start')![0]!;
    expect(event).toMatchObject({ type: 'pointerdown', pointerId: 7, clientX: 50 });
    expect(column).toEqual(COLUMN);
    expect(element).toBe(header);
    const standalone = mount(ExTableColumnControls, {
      props: { column: COLUMN, resizable: true },
    });
    await standalone.get('[role="separator"]').trigger('pointerdown');
    expect(standalone.emitted('resize-start')).toBeUndefined();
  });

  it('Home/End 采用有效边界，Escape 取消当前拖动，非导航键不发宽度事件', async () => {
    const { wrapper } = mountControls({ column: { ...COLUMN, minWidth: 80, maxWidth: 240 } });
    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes('aria-valuemin')).toBe('80');
    expect(separator.attributes('aria-valuemax')).toBe('240');
    await separator.trigger('keydown', { key: 'Home' });
    await separator.trigger('keydown', { key: 'End' });
    await separator.trigger('keydown', { key: 'Escape' });
    await separator.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('resize')).toEqual([[80], [240]]);
    expect(wrapper.emitted('resize-cancel')).toEqual([[]]);
  });

  it.each(['ltr', 'rtl'])('%s 下左右键依据实际方向增减宽度', async direction => {
    const { wrapper, header } = mountControls({ width: 160 }, direction);
    vi.mocked(header.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 160, 40));
    const separator = wrapper.get('[role="separator"]');
    const sign = direction === 'rtl' ? -1 : 1;
    await separator.trigger('keydown', { key: 'ArrowRight' });
    await separator.trigger('keydown', { key: 'ArrowLeft' });
    expect(wrapper.emitted('resize')).toEqual([
      [160 + sign * TABLE_COLUMN_KEYBOARD_STEP],
      [160 - sign * TABLE_COLUMN_KEYBOARD_STEP],
    ]);
  });

  it.each([
    { width: '142.5px', expected: 142.5 },
    { width: '50%', expected: 120 },
    { width: '12rem', expected: 120 },
    { width: 'calc(100% - 20px)', expected: 120 },
  ])('宽度 $width 只把 px 解析成数值，其他 CSS 单位读取实际列宽', async ({ width, expected }) => {
    const { wrapper, header } = mountControls({ width });
    vi.mocked(header.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, expected, 40));
    await wrapper.get('[role="separator"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('resize')).toEqual([[expected + TABLE_COLUMN_KEYBOARD_STEP]]);
    expect(wrapper.get('[role="separator"]').attributes('aria-valuenow')).toBe(
      width.endsWith('px') ? String(expected) : undefined
    );
  });

  it('没有上限时 End 不制造无限列宽，脱离表头时以最小宽度作为起点', async () => {
    const wrapper = mount(ExTableColumnControls, {
      props: { column: { key: 'name', minWidth: '10rem', maxWidth: Infinity }, resizable: true },
    });
    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes('aria-label')).toContain('name');
    expect(separator.attributes('aria-valuemax')).toBeUndefined();
    await separator.trigger('keydown', { key: 'End' });
    expect(wrapper.emitted('resize')).toBeUndefined();
    await separator.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('resize')).toEqual([
      [TABLE_MIN_COLUMN_WIDTH + TABLE_COLUMN_KEYBOARD_STEP],
    ]);
  });

  it('按钮与拖柄方向键发出逻辑顺序，点击不冒泡触发列排序', async () => {
    const { wrapper } = mountControls();
    const moves = wrapper.findAll('.ex-table-column-controls__move');
    await moves[0]!.trigger('click');
    await moves[1]!.trigger('click');
    await wrapper.get('.ex-table-column-controls__drag').trigger('keydown', { key: 'ArrowLeft' });
    await wrapper.get('.ex-table-column-controls__drag').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('move')).toEqual([['before'], ['after'], ['before'], ['after']]);
    const outerClick = vi.fn();
    wrapper.element.parentElement!.addEventListener('click', outerClick);
    await moves[0]!.trigger('click');
    expect(outerClick).not.toHaveBeenCalled();
  });

  it('原生拖放写入组件 MIME，只接受有来源列键的数据', async () => {
    const { wrapper } = mountControls();
    const drag = wrapper.get('.ex-table-column-controls__drag');
    const dataTransfer = transferData();
    await drag.trigger('dragstart', { dataTransfer });
    expect(dataTransfer.effectAllowed).toBe('move');
    expect(dataTransfer.setData).toHaveBeenCalledWith(TABLE_COLUMN_DRAG_TYPE, COLUMN.key);
    await drag.trigger('dragover', { dataTransfer });
    expect(dataTransfer.dropEffect).toBe('move');
    await drag.trigger('drop', { dataTransfer: transferData('source') });
    expect(wrapper.emitted('drop')).toEqual([['source', 'before']]);
    await drag.trigger('drop', { dataTransfer: transferData() });
    await drag.trigger('drop');
    await drag.trigger('dragover');
    await drag.trigger('dragstart');
    expect(wrapper.emitted('drop')).toHaveLength(1);
  });

  it('禁用时不可聚焦或拖放，不发送列宽和拖放变更', async () => {
    const { wrapper } = mountControls({ disabled: true });
    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes('tabindex')).toBe('-1');
    expect(separator.attributes('aria-disabled')).toBe('true');
    expect(wrapper.findAll('button').every(button => button.element.disabled)).toBe(true);
    const drag = wrapper.get('.ex-table-column-controls__drag');
    expect(drag.attributes('draggable')).toBe('false');
    const dataTransfer = transferData('source');
    await separator.trigger('pointerdown');
    await separator.trigger('keydown', { key: 'Home' });
    await drag.trigger('dragstart', { dataTransfer });
    await drag.trigger('dragover', { dataTransfer });
    await drag.trigger('drop', { dataTransfer });
    expect(dataTransfer.setData).not.toHaveBeenCalled();
    expect(dataTransfer.dropEffect).toBe('none');
    expect(wrapper.emitted('resize-start')).toBeUndefined();
    expect(wrapper.emitted('resize')).toBeUndefined();
    expect(wrapper.emitted('drop')).toBeUndefined();
  });

  it.each([NaN, Infinity, -1, 0])(
    '非法数值宽度 %s 不污染 ARIA，键盘恢复使用实测宽度',
    async width => {
      const { wrapper } = mountControls({ width });
      const separator = wrapper.get('[role="separator"]');
      expect(separator.attributes('aria-valuenow')).toBeUndefined();
      await separator.trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('resize')).toEqual([[120 + TABLE_COLUMN_KEYBOARD_STEP]]);
    }
  );

  it.each([NaN, Infinity])(
    '非法最小宽度 %s 不泄露无效辅助语义，Home 回到安全最小值',
    async minWidth => {
      const { wrapper } = mountControls({ column: { ...COLUMN, minWidth, maxWidth: 240 } });
      const separator = wrapper.get('[role="separator"]');
      expect(separator.attributes('aria-valuemin')).toBe(String(TABLE_MIN_COLUMN_WIDTH));
      await separator.trigger('keydown', { key: 'Home' });
      expect(wrapper.emitted('resize')).toEqual([[TABLE_MIN_COLUMN_WIDTH]]);
    }
  );

  it('最大宽度小于有效最小值时与业务层一致视为无上限', async () => {
    const { wrapper } = mountControls({ column: { ...COLUMN, minWidth: 100, maxWidth: 80 } });
    const separator = wrapper.get('[role="separator"]');
    expect(separator.attributes('aria-valuemax')).toBeUndefined();
    await separator.trigger('keydown', { key: 'End' });
    expect(wrapper.emitted('resize')).toBeUndefined();
  });

  it('键盘操作采用浏览器解析后的 CSS 最小宽度，不发出小于实际边界的宽度', async () => {
    const { wrapper, header } = mountControls({
      column: { ...COLUMN, minWidth: '10rem', maxWidth: 240 },
      width: 120,
    });
    // 在无布局引擎的测试环境中明确提供浏览器解析后的 CSS 像素值。
    header.style.minWidth = '160px';
    const separator = wrapper.get('[role="separator"]');
    await separator.trigger('keydown', { key: 'Home' });
    await separator.trigger('keydown', { key: 'ArrowLeft' });
    await separator.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('resize')).toEqual([[160], [160], [170]]);
    expect(separator.attributes('aria-valuemin')).toBe('160');
    expect(separator.attributes('aria-valuenow')).toBe('160');
  });

  it('表头内容撑宽声明列宽时，箭头从实际宽度起步且等待父级回写', async () => {
    const { wrapper, header } = mountControls({ width: 100 });
    vi.mocked(header.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 173, 40));
    await wrapper.get('[role="separator"]').trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('resize')).toEqual([[183]]);
    expect(wrapper.props('width')).toBe(100);
  });

  it.each([0, NaN, Infinity, -1])(
    '实际测量值 %s 不可用时仍能从受控宽度进行键盘操作',
    async width => {
      const { wrapper, header } = mountControls({ width: 100 });
      vi.mocked(header.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, width, 40));
      await wrapper.get('[role="separator"]').trigger('keydown', { key: 'ArrowRight' });
      expect(wrapper.emitted('resize')).toEqual([[110]]);
    }
  );
});
