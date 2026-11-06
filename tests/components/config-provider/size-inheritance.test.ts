import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, type Component } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExBreadcrumb from '../../../src/components/breadcrumb/ExBreadcrumb.vue';
import ExBreadcrumbItem from '../../../src/components/breadcrumb/ExBreadcrumbItem.vue';
import ExTabs from '../../../src/components/tabs/ExTabs.vue';
import ExSteps from '../../../src/components/steps/ExSteps.vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';
import ExHeatmap from '../../../src/components/heatmap/ExHeatmap.vue';
import ExBackTop from '../../../src/components/back-top/ExBackTop.vue';
import ExDialog from '../../../src/components/dialog/ExDialog.vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import ExDrawer from '../../../src/components/drawer/ExDrawer.vue';
import ExLoading from '../../../src/components/loading/ExLoading.vue';
import ExSkeleton from '../../../src/components/skeleton/ExSkeleton.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

const cases: Array<{
  name: string;
  component: Component;
  prefix: string;
  props?: Record<string, unknown>;
}> = [
  { name: 'Breadcrumb', component: ExBreadcrumb, prefix: 'ex-breadcrumb' },
  {
    name: 'BreadcrumbItem',
    component: ExBreadcrumbItem,
    prefix: 'ex-breadcrumb-item',
    props: { item: { label: '首页' }, index: 0 },
  },
  { name: 'Tabs', component: ExTabs, prefix: 'ex-tabs' },
  { name: 'Steps', component: ExSteps, prefix: 'ex-steps' },
  { name: 'Pagination', component: ExPagination, prefix: 'ex-pagination', props: { total: 100 } },
  { name: 'Heatmap', component: ExHeatmap, prefix: 'ex-heatmap', props: { data: [] } },
  { name: 'BackTop', component: ExBackTop, prefix: 'ex-back-top', props: { visibilityHeight: 0 } },
  {
    name: 'Dialog',
    component: ExDialog,
    prefix: 'ex-dialog',
    props: { modelValue: true, appendToBody: false },
  },
  {
    name: 'Modal',
    component: ExModal,
    prefix: 'ex-modal',
    props: { modelValue: true, appendToBody: false },
  },
  { name: 'Loading', component: ExLoading, prefix: 'ex-loading', props: { visible: true } },
  { name: 'Skeleton', component: ExSkeleton, prefix: 'ex-skeleton' },
];

describe('全局尺寸的跨组件继承', () => {
  it.each(cases)(
    '$name 继承动态尺寸，显式尺寸始终优先于 Provider',
    async ({ component, prefix, props }) => {
      const wrapper = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: { default: () => h(component, props) },
        attachTo: document.body,
      });
      wrappers.push(wrapper);
      await flushPromises();
      expect(document.querySelector(`.${prefix}--small`)).not.toBeNull();
      await wrapper.setProps({ size: 'large' });
      await flushPromises();
      expect(document.querySelector(`.${prefix}--large`)).not.toBeNull();

      const explicit = mount(ExConfigProvider, {
        props: { size: 'small' },
        slots: { default: () => h(component, { ...props, size: 'large' }) },
        attachTo: document.body,
      });
      wrappers.push(explicit);
      await flushPromises();
      expect(document.querySelectorAll(`.${prefix}--large`).length).toBeGreaterThanOrEqual(2);
    }
  );

  it('Drawer 继承尺寸预设，并保留业务自定义宽度', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { size: 'small' },
      slots: { default: () => h(ExDrawer, { modelValue: true }) },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await flushPromises();
    expect(document.querySelector<HTMLElement>('.ex-drawer')?.style.width).toBe('300px');
    await wrapper.setProps({ size: 'large' });
    await flushPromises();
    expect(document.querySelector<HTMLElement>('.ex-drawer')?.style.width).toBe('800px');
  });

  it('嵌套 Provider 继承最近的尺寸和语言，Steps 名称支持显式覆盖', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { size: 'large', locale: 'en-US' },
      slots: {
        default: () =>
          h(ExConfigProvider, { size: 'small', locale: 'zh-CN' }, () => [
            h(ExSteps),
            h(ExSteps, { ariaLabel: '订单处理进度' }),
          ]),
      },
    });
    wrappers.push(wrapper);
    const steps = wrapper.findAllComponents(ExSteps);
    expect(steps[0]!.classes()).toContain('ex-steps--small');
    expect(steps[0]!.attributes('aria-label')).toBe('步骤导航');
    expect(steps[1]!.attributes('aria-label')).toBe('订单处理进度');
  });
});
