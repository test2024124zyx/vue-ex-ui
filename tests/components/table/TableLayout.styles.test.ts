import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { compileStyle } from '@vue/compiler-sfc';
import { compileString } from 'sass-embedded';
import ExTable from '../../../src/components/table/ExTable.vue';

const styles: HTMLStyleElement[] = [];
afterEach(() => styles.splice(0).forEach(style => style.remove()));

describe('Table 宿主样式边界', () => {
  it('文章表格样式不会建立固定列的额外滚动祖先，圆角仍由外壳裁剪', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'name', title: '姓名', width: 180, fixed: 'left' }],
        data: [{ key: 1, name: '张三' }],
      },
      attachTo: document.body,
    });
    try {
      const element = wrapper.element as HTMLElement;
      const scope = element.getAttributeNames().find(name => name.startsWith('data-v-'))!;
      const source = pathToFileURL(resolve('src/components/table/ExTable.scss'));
      const css = compileString(readFileSync(source, 'utf8'), { url: source }).css;
      const style = document.createElement('style');
      style.textContent = `table { display: block; overflow: hidden; }\n${compileStyle({ source: css, filename: resolve('src/components/table/ExTable.scss'), id: scope, scoped: true }).code}`;
      document.head.appendChild(style);
      styles.push(style);
      const table = getComputedStyle(wrapper.get('.ex-table__main').element);
      const container = getComputedStyle(wrapper.get('.ex-table__container').element);
      expect(table.display).toBe('table');
      expect(table.overflow).toBe('visible');
      expect(container.overflowX).toBe('auto');
      expect(getComputedStyle(wrapper.element).overflow).toBe('hidden');
      expect(getComputedStyle(wrapper.get('tbody td').element).position).toBe('sticky');
    } finally {
      wrapper.unmount();
    }
  });
});
