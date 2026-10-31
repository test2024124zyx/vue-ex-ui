import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('表格部分受控分页事务', () => {
  it.each([20, 30])('父级稍后确认容量 %s 时，按确认容量保持原数据位置', async acceptedSize => {
    const pageSize = ref(10);
    const wrapper = mount({
      render: () =>
        h(ExTable, {
          columns: [{ key: 'name' }],
          data: Array.from({ length: 100 }, (_, index) => ({ key: index, name: `记录${index}` })),
          pagination: { pageSize: pageSize.value, showSizeChanger: true },
        }),
    });
    wrappers.push(wrapper);
    const pagination = wrapper.findComponent(ExPagination);
    pagination.vm.$.exposed!.goToPage(4);
    await nextTick();
    expect(wrapper.get('tbody tr').text()).toBe('记录30');
    await wrapper.get('select').setValue(20);
    expect(wrapper.get('tbody tr').text()).toBe('记录30');
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('10');
    pageSize.value = acceptedSize;
    await nextTick();
    expect(wrapper.get('tbody tr').text()).toBe(
      `记录${Math.floor(30 / acceptedSize) * acceptedSize}`
    );
  });
});
