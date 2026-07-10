import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExFileList from '../../../src/components/file-list/ExFileList.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { FileItem } from '../../../src/components/file-list/types';
import { setLocale } from '../../../src/locale';

const files: FileItem[] = [
  {
    id: '1',
    name: 'report.pdf',
    size: 2048,
    type: 'application/pdf',
    modifiedTime: new Date('2024-01-02'),
  },
  {
    id: '2',
    name: 'photo.png',
    size: 1024,
    type: 'image/png',
    modifiedTime: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'notes.txt',
    size: 512,
    type: 'text/plain',
    modifiedTime: new Date('2024-01-03'),
  },
  {
    id: '4',
    name: 'budget.xlsx',
    size: 4096,
    type: 'application/vnd.ms-excel',
    modifiedTime: new Date('2024-01-04'),
  },
  {
    id: '5',
    name: 'plan.docx',
    size: 256,
    type: 'application/msword',
    modifiedTime: new Date('2024-01-05'),
  },
];

describe('ExFileList', () => {
  afterEach(() => {
    setLocale('en-US'); // 还原默认语言，避免污染其它用例
  });

  describe('视图模式', () => {
    it.each([
      ['list', '.ex-file-list__list'],
      ['grid', '.ex-file-list__grid'],
      ['table', '.ex-file-list__table'],
      ['tree', '.ex-file-list__tree'],
    ])('view-mode=%s 渲染对应容器', async (mode, selector) => {
      const wrapper = mount(ExFileList, {
        props: { files, viewMode: mode as any },
      });
      await nextTick();
      expect(wrapper.find(`.ex-file-list__content--${mode}`).exists()).toBe(true);
      expect(wrapper.find(selector).exists()).toBe(true);
    });
  });

  describe('搜索', () => {
    it('关键字过滤并 emit search', async () => {
      const wrapper = mount(ExFileList, { props: { files } });
      await nextTick();
      expect(wrapper.findAll('.ex-file-list__list-item').length).toBe(5);

      const input = wrapper.find('.ex-file-list__search input');
      await input.setValue('photo');
      await nextTick();

      expect(wrapper.findAll('.ex-file-list__list-item').length).toBe(1);
      expect(wrapper.emitted('search')).toBeTruthy();
    });
  });

  describe('排序', () => {
    it('toggleSortOrder 切换升降序并 emit sort', async () => {
      const wrapper = mount(ExFileList, { props: { files, sortField: 'name', sortOrder: 'asc' } });
      await nextTick();
      // 工具栏中排序方向按钮（升序/降序切换）
      const sortBtn = wrapper.find('.ex-file-list__sort button');
      await sortBtn.trigger('click');

      const sortEvents = wrapper.emitted('sort') as [string, string][];
      expect(sortEvents).toBeTruthy();
      expect(sortEvents[sortEvents.length - 1]).toEqual(['name', 'desc']);
    });

    it('sortOptions 随语言切换实时更新（computed 响应式）', async () => {
      const wrapper = mount(ExFileList, { props: { files } });
      await nextTick();
      const select = wrapper.findComponent(ExSelect);
      const labelsEn = (select.props('options') as { label: string }[]).map(o => o.label);
      expect(labelsEn[0]).toBe('Name');

      setLocale('zh-CN');
      await nextTick();
      const labelsZh = (
        wrapper.findComponent(ExSelect).props('options') as { label: string }[]
      ).map(o => o.label);
      expect(labelsZh[0]).toBe('名称');
    });
  });

  describe('选择（受控 selectedIds）', () => {
    it('多选：selectFile / selectAll / getSelectedFiles', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, selectable: true, multiple: true },
      });
      const vm = wrapper.vm as any;

      vm.selectFile('1');
      vm.selectFile('2');
      await nextTick();
      let emitted = wrapper.emitted('update:selectedIds') as string[][][];
      expect(emitted[emitted.length - 1][0]).toEqual(['1', '2']);

      vm.selectAll();
      await nextTick();
      emitted = wrapper.emitted('update:selectedIds') as string[][][];
      expect(emitted[emitted.length - 1][0].length).toBe(5);
      expect(vm.getSelectedFiles().length).toBe(5);
    });

    it('单选：selectFile 替换上一个选中', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, selectable: true, multiple: false },
      });
      const vm = wrapper.vm as any;
      vm.selectFile('1');
      vm.selectFile('2');
      await nextTick();
      const emitted = wrapper.emitted('update:selectedIds') as string[][][];
      expect(emitted[emitted.length - 1][0]).toEqual(['2']);
    });

    it('外部 selected-ids 变化同步内部高亮', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, selectable: true, multiple: true, selectedIds: ['1'] },
      });
      await nextTick();
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected').length).toBe(1);

      await wrapper.setProps({ selectedIds: ['1', '2'] });
      await nextTick();
      expect(wrapper.findAll('.ex-file-list__list-item.is-selected').length).toBe(2);
    });
  });

  describe('分页', () => {
    it('showPagination 时仅渲染当前页', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, showPagination: true, pageSize: 2 },
      });
      await nextTick();
      expect(wrapper.findAll('.ex-file-list__list-item').length).toBe(2);
      expect(wrapper.find('.ex-file-list__pagination').exists()).toBe(true);
    });
  });

  describe('空态与加载态', () => {
    it('无文件时显示空态', async () => {
      const wrapper = mount(ExFileList, { props: { files: [] } });
      await nextTick();
      expect(wrapper.find('.ex-empty').exists()).toBe(true);
    });

    it('loading 时显示加载态', async () => {
      const wrapper = mount(ExFileList, { props: { files, loading: true } });
      await nextTick();
      expect(wrapper.find('.ex-file-list__loading').exists()).toBe(true);
    });
  });

  describe('操作事件', () => {
    it('点击操作按钮触发 preview / download / delete', async () => {
      const wrapper = mount(ExFileList, {
        props: { files, previewable: true, downloadable: true, deletable: true },
      });
      await nextTick();
      const firstItem = wrapper.find('.ex-file-list__list-item');
      const btns = firstItem.findAll('.ex-file-list__action-btn');
      await btns[0].trigger('click'); // preview
      await btns[1].trigger('click'); // download
      await btns[2].trigger('click'); // delete

      expect(wrapper.emitted('preview')).toBeTruthy();
      expect(wrapper.emitted('download')).toBeTruthy();
      expect(wrapper.emitted('delete')).toBeTruthy();
    });

    it('getElement() 返回根 DOM 元素', () => {
      const wrapper = mount(ExFileList, { props: { files } });
      expect((wrapper.vm as any).getElement()).toBeInstanceOf(HTMLElement);
    });
  });
});
