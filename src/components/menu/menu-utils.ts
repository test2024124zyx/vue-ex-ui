import type { MenuItem, MenuMode } from './types';

const MENU_MODES = new Set<MenuMode>(['horizontal', 'vertical', 'inline']);

export function normalizeMenuMode(value: unknown): MenuMode {
  return MENU_MODES.has(value as MenuMode) ? (value as MenuMode) : 'vertical';
}

/** 清除空键、非字符串与重复项，同时保留调用方给出的顺序。 */
export function normalizeMenuKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const result: string[] = [];
  const seen = new Set<string>();
  for (const key of value) {
    if (typeof key !== 'string' || key.trim() === '' || seen.has(key)) continue;
    seen.add(key);
    result.push(key);
  }
  return result;
}

/**
 * 在渲染前校验递归菜单数据，阻止重复键、循环引用和不可访问的空标签。
 */
export function validateMenuItems(value: unknown): MenuItem[] {
  if (!Array.isArray(value)) throw new TypeError('Menu items 必须是数组');

  const keys = new Set<string>();
  const ancestors = new Set<MenuItem>();

  const visit = (items: unknown[]): void => {
    for (const candidate of items) {
      if (!candidate || typeof candidate !== 'object') {
        throw new TypeError('Menu item 必须是对象');
      }
      const item = candidate as MenuItem;
      if (typeof item.key !== 'string' || item.key.trim() === '') {
        throw new TypeError('Menu item key 必须是非空字符串');
      }
      if (typeof item.label !== 'string' || item.label.trim() === '') {
        throw new TypeError(`Menu item "${item.key}" 的 label 必须是非空字符串`);
      }
      if (ancestors.has(item)) {
        throw new TypeError(`Menu item "${item.key}" 存在循环 children 引用`);
      }
      if (keys.has(item.key)) {
        throw new TypeError(`Menu item key "${item.key}" 重复`);
      }

      keys.add(item.key);
      if (item.children === undefined) continue;
      if (!Array.isArray(item.children)) {
        throw new TypeError(`Menu item "${item.key}" 的 children 必须是数组`);
      }
      if (item.children.length === 0) continue;
      if (item.href !== undefined || item.target !== undefined || item.rel !== undefined) {
        throw new TypeError(`Menu item "${item.key}" 不能同时声明 children 与链接属性`);
      }

      ancestors.add(item);
      visit(item.children);
      ancestors.delete(item);
    }
  };

  visit(value);
  return value as MenuItem[];
}

export function buildMenuItemMap(items: MenuItem[]): Map<string, MenuItem> {
  const result = new Map<string, MenuItem>();
  const visit = (nodes: MenuItem[]): void => {
    for (const item of nodes) {
      result.set(item.key, item);
      if (item.children?.length) visit(item.children);
    }
  };
  visit(items);
  return result;
}

/** 搜索命中后保留完整节点，后代命中时只保留对应祖先链。 */
export function filterMenuItems(items: MenuItem[], query: string): MenuItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return items;

  const result: MenuItem[] = [];
  for (const item of items) {
    if (item.label.toLocaleLowerCase().includes(normalizedQuery)) {
      result.push(item);
      continue;
    }

    const children = item.children ? filterMenuItems(item.children, normalizedQuery) : undefined;
    if (children?.length) result.push({ ...item, children });
  }
  return result;
}

const findDirectAction = (child: Element): HTMLElement | null => {
  if (child.classList.contains('ex-menu-item')) {
    return child.querySelector<HTMLElement>(':scope > .ex-menu-item__action');
  }
  if (!child.classList.contains('ex-submenu')) return null;

  return child.querySelector<HTMLElement>(
    ':scope > .ex-submenu__title, :scope > .ex-dropdown > .ex-dropdown__trigger > .ex-submenu__title'
  );
};

/** 获取当前 ul 的直接交互子项，不会误收集后代子菜单。 */
export function getDirectMenuActions(list: HTMLElement): HTMLElement[] {
  return Array.from(list.children)
    .map(findDirectAction)
    .filter(
      (action): action is HTMLElement =>
        action !== null &&
        !action.hasAttribute('disabled') &&
        action.getAttribute('aria-disabled') !== 'true'
    );
}

export type MenuFocusDirection = 'next' | 'previous' | 'first' | 'last';

/** 在当前菜单层级移动焦点并返回实际目标。 */
export function moveMenuFocus(
  current: HTMLElement,
  direction: MenuFocusDirection
): HTMLElement | null {
  const list = current.closest<HTMLElement>('ul[data-ex-menu-list]');
  if (!list) return null;
  const actions = getDirectMenuActions(list);
  const currentIndex = actions.indexOf(current);
  if (currentIndex < 0 || actions.length === 0) return null;

  const targetIndex =
    direction === 'first'
      ? 0
      : direction === 'last'
        ? actions.length - 1
        : direction === 'next'
          ? (currentIndex + 1) % actions.length
          : (currentIndex - 1 + actions.length) % actions.length;

  const target = actions[targetIndex] ?? null;
  target?.focus({ preventScroll: true });
  return target;
}
