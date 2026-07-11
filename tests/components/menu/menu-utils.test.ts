import { describe, expect, it } from 'vitest';
import {
  buildMenuItemMap,
  filterMenuItems,
  getDirectMenuActions,
  moveMenuFocus,
  normalizeMenuKeys,
  normalizeMenuMode,
  validateMenuItems,
} from '../../../src/components/menu/menu-utils';
import type { MenuItem } from '../../../src/components/menu/types';

describe('Menu 工具函数', () => {
  it('模式与键数组只保留真实有效值', () => {
    expect(normalizeMenuMode('horizontal')).toBe('horizontal');
    expect(normalizeMenuMode('unknown')).toBe('vertical');
    expect(normalizeMenuMode(undefined)).toBe('vertical');
    expect(normalizeMenuKeys(['a', '', 'a', 1, 'b'])).toEqual(['a', 'b']);
    expect(normalizeMenuKeys('a')).toEqual([]);
  });

  it('校验任意深度数据并构建完整索引', () => {
    const items: MenuItem[] = [
      {
        key: 'root',
        label: '根节点',
        children: [
          {
            key: 'group',
            label: '分组',
            children: [{ key: 'leaf', label: '叶节点' }],
          },
        ],
      },
    ];

    expect(validateMenuItems(items)).toBe(items);
    expect(Array.from(buildMenuItemMap(items).keys())).toEqual(['root', 'group', 'leaf']);
  });

  it('重复键、循环数据和非法字段显式报错', () => {
    expect(() =>
      validateMenuItems([
        { key: 'same', label: 'A' },
        { key: 'same', label: 'B' },
      ])
    ).toThrow(/same/);
    expect(() => validateMenuItems([{ key: '', label: 'A' }])).toThrow(TypeError);
    expect(() => validateMenuItems([{ key: 'a', label: '' }])).toThrow(TypeError);
    expect(() => validateMenuItems([{ key: 'a', label: 'A', children: {} as never }])).toThrow(
      TypeError
    );
    expect(() => validateMenuItems([null] as never)).toThrow(TypeError);
    expect(() =>
      validateMenuItems([
        {
          key: 'parent-link',
          label: '父链接',
          href: '/parent',
          children: [{ key: 'child', label: '子项' }],
        },
      ])
    ).toThrow(/children/);

    const cyclic: MenuItem = { key: 'cycle', label: '循环' };
    cyclic.children = [cyclic];
    expect(() => validateMenuItems([cyclic])).toThrow(/循环/);
  });

  it('搜索保留命中节点的祖先链，自身命中时保留完整后代', () => {
    const items: MenuItem[] = [
      {
        key: 'tools',
        label: '工具',
        children: [
          { key: 'editor', label: '代码编辑器' },
          { key: 'terminal', label: '终端' },
        ],
      },
      { key: 'settings', label: '设置' },
    ];

    expect(filterMenuItems(items, '编辑')).toEqual([
      {
        key: 'tools',
        label: '工具',
        children: [{ key: 'editor', label: '代码编辑器' }],
      },
    ]);
    expect(filterMenuItems(items, '工具')).toEqual([items[0]]);
    expect(filterMenuItems(items, '   ')).toBe(items);
  });

  it('只收集同级直接动作并跳过禁用项', () => {
    const list = document.createElement('ul');
    list.dataset.exMenuList = '';
    list.innerHTML = `
      <li class="ex-menu-item"><button class="ex-menu-item__action" data-menu-key="a">A</button></li>
      <li class="ex-menu-item"><button class="ex-menu-item__action" data-menu-key="b" disabled>B</button></li>
      <li class="ex-submenu"><button class="ex-submenu__title" data-menu-key="group">Group</button></li>
      <li class="ex-submenu">
        <div class="ex-dropdown"><span class="ex-dropdown__trigger"><button class="ex-submenu__title" data-menu-key="popup">Popup</button></span></div>
      </li>
    `;

    expect(getDirectMenuActions(list).map(item => item.dataset.menuKey)).toEqual([
      'a',
      'group',
      'popup',
    ]);
  });

  it('焦点移动支持循环、首尾并返回目标元素', () => {
    const list = document.createElement('ul');
    list.dataset.exMenuList = '';
    list.innerHTML = `
      <li class="ex-menu-item"><button class="ex-menu-item__action" data-menu-key="a">A</button></li>
      <li class="ex-menu-item"><button class="ex-menu-item__action" data-menu-key="b">B</button></li>
      <li class="ex-menu-item"><button class="ex-menu-item__action" data-menu-key="c">C</button></li>
    `;
    document.body.appendChild(list);
    const actions = getDirectMenuActions(list);

    expect(moveMenuFocus(actions[0], 'previous')).toBe(actions[2]);
    expect(document.activeElement).toBe(actions[2]);
    expect(moveMenuFocus(actions[2], 'next')).toBe(actions[0]);
    expect(moveMenuFocus(actions[0], 'last')).toBe(actions[2]);
    expect(moveMenuFocus(actions[2], 'first')).toBe(actions[0]);
    expect(moveMenuFocus(document.createElement('button'), 'next')).toBeNull();

    list.remove();
  });
});
