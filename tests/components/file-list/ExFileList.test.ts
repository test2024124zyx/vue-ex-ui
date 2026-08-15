import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExFileList from '../../../src/components/file-list/ExFileList.vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import ExTree from '../../../src/components/tree/ExTree.vue';
import type { FileItem } from '../../../src/components/file-list/types';
import { setLocale } from '../../../src/locale';

const files: FileItem[] = [
  {
    id: '1',
    name: 'report.pdf',
    size: 2048,
    type: 'application/pdf',
    modifiedTime: new Date('2024-01-02T08:30:00Z'),
  },
  {
    id: '2',
    name: 'photo.png',
    size: 1024,
    type: 'image/png',
    modifiedTime: new Date('2024-01-01T08:30:00Z'),
  },
  {
    id: '3',
    name: 'notes.txt',
    size: 512,
    type: 'text/plain',
    modifiedTime: new Date('2024-01-03T08:30:00Z'),
  },
  {
    id: '4',
    name: 'budget.xlsx',
    size: 4096,
    type: 'application/vnd.ms-excel',
    modifiedTime: new Date('2024-01-04T08:30:00Z'),
  },
  {
    id: '5',
    name: 'plan.docx',
    size: 256,
    type: 'application/msword',
    modifiedTime: new Date('2024-01-05T08:30:00Z'),
  },
];

const nestedFiles: FileItem[] = [
  {
    id: 'folder',
    name: 'archive',
    isDirectory: true,
    children: [
      {
        id: 'child',
        name: 'target.pdf',
        size: 128,
        type: 'application/pdf',
      },
    ],
  },
];

describe('ExFileList', () => {
  afterEach(() => {
    // 恢复进程级语言，避免跨用例污染。
    setLocale('en-US');
  });

  describe('视图状态', () => {
    it.each([
      ['list', '.ex-file-list__list'],
      ['grid', '.ex-file-list__grid'],
      ['table', '.ex-file-list__table'],
      ['tree', '.ex-file-list__tree'],
    ] as const)('viewMode=%s 渲染对应语义容器', (mode, selector) => {
      const wrapper = mount(ExFileList, { props: { files, viewMode: mode } });
      expect(wrapper.find(`.ex-file-list__content--${mode}`).exists()).toBe(true);
      expect(wrapper.find(selector).exists()).toBe(true);
    });

    it('受控视图只发出请求，父级同步后才真正切换', async () => {
      const wrapper = mount(ExFileList, { props: { files, viewMode: 'list' } });

      await wrapper.get('[aria-label="Grid"]').trigger('click');
      expect(wrapper.emitted('update:viewMode')).toEqual([['grid']]);
      expect(wrapper.find('.ex-file-list__list').exists()).toBe(true);

      await wrapper.setProps({ viewMode: 'grid' });
      expect(wrapper.find('.ex-file-list__grid').exists()).toBe(true);
    });

    it('非受控视图使用 defaultViewMode 并在交互后立即切换', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, defaultViewMode: 'table' },
      });
      expect(wrapper.find('.ex-file-list__table').exists()).toBe(true);

      await wrapper.get('[aria-label="List"]').trigger('click');
      expect(wrapper.find('.ex-file-list__list').exists()).toBe(true);
    });
  });

  describe('搜索与排序', () => {
    it('非受控搜索过滤文件并同时发出 v-model 与搜索事件', async () => {
      const wrapper = mount(ExFileList, { props: { files } });
      await wrapper.get('.ex-file-list__search input').setValue(' PHOTO ');

      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(1);
      expect(wrapper.text()).toContain('photo.png');
      expect(wrapper.emitted('update:searchValue')?.at(-1)).toEqual([' PHOTO ']);
      expect(wrapper.emitted('search')?.at(-1)).toEqual([' PHOTO ']);
    });

    it('受控搜索值未同步时不伪造过滤结果', async () => {
      const wrapper = mount(ExFileList, { props: { files, searchValue: '' } });
      await wrapper.get('.ex-file-list__search input').setValue('photo');

      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(5);
      expect(wrapper.emitted('update:searchValue')).toEqual([['photo']]);

      await wrapper.setProps({ searchValue: 'photo' });
      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(1);
    });

    it('受控排序方向等待父级同步，并保持排序事件载荷一致', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, sortField: 'name', sortOrder: 'asc' },
      });
      const names = () => wrapper.findAll('.ex-file-list__list-item-name').map(node => node.text());
      expect(names()[0]).toBe('budget.xlsx');

      await wrapper.get('[aria-label="Sort descending"]').trigger('click');
      expect(wrapper.emitted('update:sortOrder')).toEqual([['desc']]);
      expect(wrapper.emitted('sort')).toEqual([['name', 'desc']]);
      expect(names()[0]).toBe('budget.xlsx');

      await wrapper.setProps({ sortOrder: 'desc' });
      expect(names()[0]).toBe('report.pdf');
    });

    it('排序选项随进程级语言变化实时更新', async () => {
      const wrapper = mount(ExFileList, { props: { files } });
      const labels = () =>
        (wrapper.findComponent(ExSelect).props('options') as { label: string }[]).map(
          option => option.label
        );
      expect(labels()[0]).toBe('Name');

      setLocale('zh-CN');
      await nextTick();
      expect(labels()[0]).toBe('名称');
    });
  });

  describe('选择状态', () => {
    it('受控选择只发出下一状态，父级同步前不改变高亮', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, selectable: true, multiple: true, selectedIds: [] },
      });

      await wrapper.get('[aria-label="Select report.pdf"]').setValue(true);
      expect(wrapper.emitted('update:selectedIds')).toEqual([[['1']]]);
      expect(wrapper.emitted('selection-request')?.[0]).toEqual([files[0], true, ['1']]);
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(0);

      await wrapper.setProps({ selectedIds: ['1'] });
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(1);
    });

    it('非受控单选使用默认值并替换旧选择', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files,
          selectable: true,
          multiple: false,
          defaultSelectedIds: ['1'],
        },
      });

      await wrapper.get('[aria-label="Select photo.png"]').setValue(true);
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(1);
      expect(wrapper.find('.ex-file-list__list-item.is-selected').text()).toContain('photo.png');
      expect(wrapper.emitted('update:selectedIds')?.at(-1)).toEqual([['2']]);
    });

    it('从多选切换到单选后不会在再次开启多选时恢复陈旧选择', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files,
          selectable: true,
          multiple: true,
          defaultSelectedIds: ['1', '2'],
        },
      });
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(2);

      await wrapper.setProps({ multiple: false });
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(1);
      expect(wrapper.emitted('update:selectedIds')?.at(-1)).toEqual([['1']]);

      await wrapper.setProps({ multiple: true });
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(1);
    });

    it('全选仅修改当前可见项并保留搜索范围外的选择', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files,
          selectable: true,
          multiple: true,
          defaultSelectedIds: ['1'],
        },
      });
      await wrapper.get('.ex-file-list__search input').setValue('photo');
      await wrapper.get('[aria-label="Select visible files"]').trigger('click');
      await wrapper.get('.ex-file-list__search input').setValue('');

      expect(wrapper.findAll('.ex-file-list__list-item.is-selected')).toHaveLength(2);
      expect(wrapper.emitted('update:selectedIds')?.at(-1)?.[0]).toEqual(['1', '2']);
    });

    it('getSelectedFiles 返回递归数据中的真实原始对象', () => {
      const wrapper = mount(ExFileList, {
        props: {
          files: nestedFiles,
          selectable: true,
          multiple: true,
          defaultSelectedIds: ['child'],
        },
      });

      expect((wrapper.vm as { getSelectedFiles: () => FileItem[] }).getSelectedFiles()).toEqual([
        nestedFiles[0].children?.[0],
      ]);
    });

    it('树形多选遵守 FileList 的受控选择语义且不级联伪选中后代', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files: nestedFiles,
          defaultViewMode: 'tree',
          selectable: true,
          multiple: true,
          selectedIds: [],
        },
      });
      const checkbox = wrapper.get('.ex-tree-node__checkbox input');

      await checkbox.setValue(true);
      await nextTick();

      expect(wrapper.emitted('update:selectedIds')).toEqual([[['folder']]]);
      expect(wrapper.emitted('selection-request')?.[0]).toEqual([nestedFiles[0], true, ['folder']]);
      expect((checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('树形单选转发选择请求，并由 FileList 真实管理展开状态', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files: nestedFiles,
          defaultViewMode: 'tree',
          selectable: true,
          selectedIds: [],
        },
      });

      await wrapper.get('.ex-tree-node__expand-icon').trigger('click');
      expect(wrapper.findAll('[role="treeitem"]')).toHaveLength(2);

      await wrapper.findAll('.ex-tree-node__content')[1].trigger('click');
      expect(wrapper.emitted('update:selectedIds')?.at(-1)).toEqual([['child']]);
      expect(wrapper.emitted('selection-request')?.at(-1)).toEqual([
        nestedFiles[0].children?.[0],
        true,
        ['child'],
      ]);
      expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(0);
    });

    it('删除无法兑现语义的命令式刷新和选择 API', () => {
      const wrapper = mount(ExFileList, { props: { files } });
      const vm = wrapper.vm as unknown as Record<string, unknown>;

      expect(vm.refresh).toBeUndefined();
      expect(vm.selectAll).toBeUndefined();
      expect(vm.selectFile).toBeUndefined();
      expect(vm.unselectFile).toBeUndefined();
    });
  });

  describe('分页与递归数据', () => {
    it('只渲染当前页，禁用没有状态接收方的页容量切换器', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, showPagination: true, pageSize: 2 },
      });
      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(2);
      expect(wrapper.findComponent(ExPagination).props('showSizeChanger')).toBe(false);

      (
        wrapper.findComponent(ExPagination).vm as unknown as { goToPage: (page: number) => void }
      ).goToPage(3);
      await nextTick();
      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(1);
      expect(wrapper.text()).toContain('report.pdf');
      expect(wrapper.emitted('update:currentPage')?.at(-1)).toEqual([3]);
      expect(wrapper.emitted('page-change')?.at(-1)).toEqual([3]);
    });

    it('数据收缩后把非受控页码钳制到真实末页', async () => {
      const wrapper = mount(ExFileList, {
        props: {
          files,
          showPagination: true,
          pageSize: 2,
          defaultCurrentPage: 3,
        },
      });
      expect(wrapper.text()).toContain('report.pdf');

      await wrapper.setProps({ files: files.slice(0, 1) });
      await nextTick();
      expect(wrapper.text()).toContain('report.pdf');
      expect(wrapper.emitted('update:currentPage')?.at(-1)).toEqual([1]);
    });

    it('非法 pageSize 安全回退为 20', () => {
      const manyFiles: FileItem[] = Array.from({ length: 25 }, (_, index) => ({
        id: String(index),
        name: `file${index}.txt`,
      }));
      const wrapper = mount(ExFileList, {
        props: { files: manyFiles, showPagination: true, pageSize: 0 },
      });

      expect(wrapper.findAll('.ex-file-list__list-item')).toHaveLength(20);
      expect(wrapper.findComponent(ExPagination).props('pageSize')).toBe(20);
    });

    it('树搜索保留祖先并自动展开命中的后代，节点点击只发出一次事件', async () => {
      const wrapper = mount(ExFileList, {
        props: { files: nestedFiles, defaultViewMode: 'tree' },
      });
      await wrapper.get('.ex-file-list__search input').setValue('target');

      expect(wrapper.findComponent(ExTree).props('data')).toHaveLength(1);
      expect(wrapper.text()).toContain('archive');
      expect(wrapper.text()).toContain('target.pdf');

      await wrapper.findAll('.ex-tree-node__content')[1].trigger('click');
      expect(wrapper.emitted('click')).toHaveLength(1);
      expect(wrapper.emitted('click')?.[0]).toEqual([nestedFiles[0].children?.[0]]);
    });
  });

  describe('显示、操作与无障碍', () => {
    it('缺失文件元数据时稳定显示占位符，目录不提供伪预览和下载操作', () => {
      const directory: FileItem = { id: 'dir', name: 'folder', isDirectory: true };
      const incomplete: FileItem = { id: 'file', name: 'unknown' };
      const wrapper = mount(ExFileList, {
        props: {
          files: [directory, incomplete],
          defaultViewMode: 'table',
          previewable: true,
          downloadable: true,
          deletable: true,
        },
      });
      const rows = wrapper.findAll('tbody tr');

      expect(rows[0].find('[aria-label="Preview folder"]').exists()).toBe(false);
      expect(rows[0].find('[aria-label="Download folder"]').exists()).toBe(false);
      expect(rows[0].find('[aria-label="Delete folder"]').exists()).toBe(true);
      expect(rows[1].text()).toContain('-');
    });

    it.each(['list', 'grid', 'table', 'tree'] as const)(
      '%s 视图的操作按钮提供可访问名称并只发出明确请求事件',
      async mode => {
        const wrapper = mount(ExFileList, {
          props: { files: files.slice(0, 1), defaultViewMode: mode },
        });

        await wrapper.get('[aria-label="Preview report.pdf"]').trigger('click');
        await wrapper.get('[aria-label="Download report.pdf"]').trigger('click');
        await wrapper.get('[aria-label="Delete report.pdf"]').trigger('click');

        expect(wrapper.emitted('preview-request')).toEqual([[files[0]]]);
        expect(wrapper.emitted('download-request')).toEqual([[files[0]]]);
        expect(wrapper.emitted('delete-request')).toEqual([[files[0]]]);
        expect(wrapper.emitted('preview')).toBeUndefined();
        expect(wrapper.emitted('download')).toBeUndefined();
        expect(wrapper.emitted('delete')).toBeUndefined();
      }
    );

    it('列表使用 list/listitem 结构，缩略图为装饰图，加载态会播报', async () => {
      const thumbnailFile: FileItem = {
        id: 'thumbnail',
        name: 'photo.png',
        thumbUrl: '/photo.png',
      };
      const wrapper = mount(ExFileList, { props: { files: [thumbnailFile] } });

      expect(wrapper.get('.ex-file-list__list').element.tagName).toBe('UL');
      expect(wrapper.get('.ex-file-list__list-item').element.tagName).toBe('LI');
      expect(wrapper.get('img').attributes('alt')).toBe('');
      expect(wrapper.get('.ex-file-list').attributes('aria-busy')).toBe('false');

      await wrapper.setProps({ loading: true });
      expect(wrapper.get('.ex-file-list').attributes('aria-busy')).toBe('true');
      expect(wrapper.get('.ex-file-list__loading').attributes('role')).toBe('status');
    });

    it('日期格式跟随最近的 ConfigProvider 而非硬编码中文区域', () => {
      const date = files[0].modifiedTime as Date;
      const host = mount(ExConfigProvider, {
        props: { locale: 'zh-CN' },
        slots: {
          default: () => h(ExFileList, { files: files.slice(0, 1), viewMode: 'table' }),
        },
      });
      const expected = new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);

      expect(host.text()).toContain(expected);
    });

    it('getElement 返回真实根元素', () => {
      const wrapper = mount(ExFileList, { props: { files } });
      expect((wrapper.vm as { getElement: () => HTMLElement | null }).getElement()).toBeInstanceOf(
        HTMLElement
      );
    });
  });
});
