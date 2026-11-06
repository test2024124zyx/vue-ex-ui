import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('Pagination 严格受控', () => {
  it('页码和容量均受控时只请求更新，原生控件也恢复已确认值', async () => {
    const wrapper = mount(ExPagination, {
      props: { current: 4, pageSize: 10, total: 200, showSizeChanger: true, showQuickJumper: true },
    });
    wrappers.push(wrapper);
    await wrapper.get('.ex-pagination__next').trigger('click');
    expect(wrapper.get('[aria-current="page"]').text()).toBe('4');
    const jump = wrapper.get<HTMLInputElement>('.ex-pagination__jumper-input');
    await jump.setValue(7);
    await jump.trigger('keyup', { key: 'Enter' });
    expect(jump.element.value).toBe('4');
    const select = wrapper.get<HTMLSelectElement>('select');
    await select.setValue(20);
    expect(select.element.value).toBe('10');
    expect(wrapper.get('[aria-current="page"]').text()).toBe('4');
    expect(wrapper.emitted('update:current')).toEqual([[5], [7], [2]]);
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2, 20]);
    await wrapper.setProps({ current: 2, pageSize: 20 });
    expect(select.element.value).toBe('20');
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2');
    wrapper.vm.goToPage(4);
    await wrapper.setProps({ current: undefined, pageSize: undefined });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2');
    wrapper.vm.next();
    await nextTick();
    expect(wrapper.get('[aria-current="page"]').text()).toBe('3');
  });

  it('只控制容量时保持旧页码，父级确认容量后再同时调整位置', async () => {
    const wrapper = mount(ExPagination, {
      props: { pageSize: 10, total: 200, showSizeChanger: true },
    });
    wrappers.push(wrapper);
    wrapper.vm.goToPage(4);
    await nextTick();
    await wrapper.get('select').setValue(20);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('4');
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('10');
    await wrapper.setProps({ pageSize: 20 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2');
  });

  it('容量请求等待期间的新导航使旧位置请求失效', async () => {
    const wrapper = mount(ExPagination, {
      props: { pageSize: 10, total: 200, showSizeChanger: true },
    });
    wrappers.push(wrapper);
    wrapper.vm.goToPage(4);
    await nextTick();
    await wrapper.get('select').setValue(20);
    wrapper.vm.goToPage(5);
    await wrapper.setProps({ pageSize: 20 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('5');
  });

  it('清空快速跳页后回车恢复确认页，不请求第一页', async () => {
    const wrapper = mount(ExPagination, {
      props: { current: 5, total: 100, showQuickJumper: true },
    });
    wrappers.push(wrapper);
    const input = wrapper.get<HTMLInputElement>('.ex-pagination__jumper-input');
    await input.setValue('');
    await input.trigger('keyup', { key: 'Enter' });
    expect(wrapper.emitted('update:current')).toBeUndefined();
    expect(input.element.value).toBe('5');
  });

  it('只控制页码时容量正常提交，页码请求仍需父级回写', async () => {
    const wrapper = mount(ExPagination, {
      props: { current: 4, total: 200, showSizeChanger: true },
    });
    wrappers.push(wrapper);
    await wrapper.get('select').setValue(20);
    expect(wrapper.get<HTMLSelectElement>('select').element.value).toBe('20');
    expect(wrapper.get('[aria-current="page"]').text()).toBe('4');
    expect(wrapper.emitted('update:current')).toEqual([[2]]);
  });

  it('非受控导航在总数变化后保留当前页并处理边界，禁用后公开方法不绕过限制', async () => {
    const wrapper = mount(ExPagination, { props: { total: 100 } });
    wrappers.push(wrapper);
    wrapper.vm.goToPage(4);
    await wrapper.setProps({ total: 200 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('4');
    await wrapper.setProps({ total: 20 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('2');
    await wrapper.setProps({ total: 100, disabled: true });
    const count = wrapper.emitted('update:current')?.length;
    wrapper.vm.goToPage(5);
    wrapper.vm.prev();
    wrapper.vm.next();
    expect(wrapper.emitted('update:current')?.length).toBe(count);
  });
});
