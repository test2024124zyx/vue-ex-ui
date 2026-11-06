import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { afterEach, expect, it, vi } from 'vitest';
import Tabs from '../../src/components/tabs/ExTabs.vue';
import Pane from '../../src/components/tabs/ExTabPane.vue';
import Carousel from '../../src/components/carousel/ExCarousel.vue';
import CarouselItem from '../../src/components/carousel/ExCarouselItem.vue';
import Steps from '../../src/components/steps/ExSteps.vue';
import Step from '../../src/components/steps/ExStep.vue';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
});
const flush = async () => {
  await nextTick();
  await nextTick();
  await nextTick();
};

it('Tabs 服务端输出导航和活动面板', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(Tabs, null, () => h(Pane, { name: 'a', label: 'A' }, () => '内容')),
    })
  );
  expect(html).toContain('role="tab"');
  expect(html).toContain('aria-selected="true"');
  expect(html).toContain('ex-tab-pane--active');
});

it('Tabs 导航跟随 keyed 插槽重排，清空后新项自动激活', async () => {
  const names = ref(['a', 'b']);
  const wrapper = mount(Tabs, {
    slots: { default: () => names.value.map(name => h(Pane, { key: name, name, label: name })) },
  });
  await flush();
  names.value = ['b', 'a'];
  await flush();
  expect(wrapper.findAll('[role="tab"]').map(tab => tab.text())).toEqual(['b', 'a']);
  names.value = [];
  await flush();
  names.value = ['c'];
  await flush();
  expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('c');
});

it('Tabs 卸载后排队的指示器更新安全结束', async () => {
  const wrapper = mount(Tabs, { slots: { default: () => h(Pane, { name: 'a' }) } });
  wrapper.unmount();
  await flush();
});

it('Carousel 服务端包含正确的活动项和指示器', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(Carousel, { modelValue: 1, autoplay: false, effect: 'fade' }, () =>
          ['a', 'b'].map(name => h(CarouselItem, { key: name }, () => name))
        ),
    })
  );
  expect((html.match(/ex-carousel-item--active/g) ?? []).length).toBe(1);
  expect((html.match(/class="ex-carousel__indicator /g) ?? []).length).toBeGreaterThan(0);
  const root = document.createElement('div');
  root.innerHTML = html;
  expect(root.querySelector('.ex-carousel-item--active')?.textContent).toBe('b');
});

it('Carousel 保留空数据期间更新的索引', async () => {
  const names = ref<string[]>([]);
  const wrapper = mount(Carousel, {
    props: { modelValue: 0, autoplay: false },
    slots: { default: () => names.value.map(name => h(CarouselItem, { key: name }, () => name)) },
  });
  await flush();
  await wrapper.setProps({ modelValue: 2 });
  names.value = ['a', 'b', 'c'];
  await flush();
  expect(wrapper.get('.ex-carousel-item--active').text()).toBe('c');
});

it('Carousel 悬停期间新增子项不恢复自动播放', async () => {
  const interval = vi.spyOn(window, 'setInterval');
  const names = ref(['a', 'b']);
  const wrapper = mount(Carousel, {
    slots: { default: () => names.value.map(name => h(CarouselItem, { key: name }, () => name)) },
  });
  await flush();
  await wrapper.trigger('mouseenter');
  interval.mockClear();
  names.value.push('c');
  await flush();
  expect(interval).not.toHaveBeenCalled();
});

it('Steps 服务端只有最后一个步骤省略连接线', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () => h(Steps, null, () => ['a', 'b', 'c'].map(title => h(Step, { title }))),
    })
  );
  expect((html.match(/ex-step--last/g) ?? []).length).toBe(1);
});

it('Steps 拒绝非整数索引和输入法确认', async () => {
  const wrapper = mount(Steps, {
    props: { clickable: true },
    slots: { default: () => [h(Step, { title: 'A' }), h(Step, { title: 'B' })] },
  });
  wrapper.vm.goTo(0.5);
  await wrapper.get('.ex-step').trigger('keydown', { key: 'Enter', isComposing: true });
  expect(wrapper.emitted('change')).toBeUndefined();
});
