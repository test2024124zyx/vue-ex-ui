import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { defineComponent, h, inject, ref, type VNode } from 'vue';
import ExTree from '../../src/components/tree/ExTree.vue';
import ExTabs from '../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../src/components/tabs/ExTabPane.vue';
import ExSteps from '../../src/components/steps/ExSteps.vue';
import ExStep from '../../src/components/steps/ExStep.vue';
import ExRadioGroup from '../../src/components/radio/ExRadioGroup.vue';
import ExRadio from '../../src/components/radio/ExRadio.vue';
import ExTimeline from '../../src/components/timeline/ExTimeline.vue';
import ExTimelineItem from '../../src/components/timeline/ExTimelineItem.vue';

enableAutoUnmount(afterEach);

const hostValue = '宿主值';
const mountHost = (legacyKeys: string[], render: (probe: VNode) => VNode) => {
  const Probe = defineComponent({
    setup() {
      const values = legacyKeys.map(key => inject(key));
      return () => h('output', values.map(value => value === hostValue).join(','));
    },
  });
  const wrapper = mount(defineComponent({ setup: () => () => render(h(Probe)) }), {
    global: { provide: Object.fromEntries(legacyKeys.map(key => [key, hostValue])) },
  });
  expect(wrapper.get('output').text()).toBe(legacyKeys.map(() => 'true').join(','));
  return wrapper;
};

describe('复合组件与宿主字符串注入键隔离', () => {
  it('树节点插槽读到宿主 tree，树仍正常渲染', () => {
    const wrapper = mountHost(['tree'], probe =>
      h(ExTree, { data: [{ key: 'item', label: '树节点' }] }, { default: () => probe })
    );
    expect(wrapper.get('[role="treeitem"]').text()).toContain('true');
  });

  it('Tabs 内部注册和 ARIA 关联不覆盖宿主同名值', () => {
    const wrapper = mountHost(
      [
        'exTabsUid',
        'getTabId',
        'getPanelId',
        'activeTab',
        'registerPane',
        'updatePane',
        'unregisterPane',
      ],
      probe =>
        h(ExTabs, { modelValue: 'tab' }, () =>
          h(ExTabPane, { name: 'tab', label: '标签' }, () => probe)
        )
    );
    const tab = wrapper.get('[role="tab"]');
    const pane = wrapper.get('[role="tabpanel"]');
    expect(tab.attributes('aria-controls')).toBe(pane.attributes('id'));
    expect(pane.attributes('aria-labelledby')).toBe(tab.attributes('id'));
  });

  it('Steps 继续传递当前步骤，业务插槽读到宿主 exSteps', () => {
    const wrapper = mountHost(['exSteps'], probe =>
      h(ExSteps, { current: 0 }, () => h(ExStep, { title: '步骤' }, { title: () => probe }))
    );
    expect(wrapper.get('.ex-step').attributes('aria-current')).toBe('step');
  });

  it('RadioGroup 继续传递选中组值，业务插槽读到宿主 radioGroup', () => {
    const wrapper = mountHost(['radioGroup'], probe =>
      h(ExRadioGroup, { modelValue: 'item' }, () => [h(ExRadio, { value: 'item' }), probe])
    );
    expect(wrapper.get('input').element.checked).toBe(true);
  });

  it('独立 Radio 不使用宿主 radioGroup 的值、尺寸或名称', () => {
    const wrapper = mount(ExRadio, {
      props: { modelValue: true, value: true, size: 'small', name: 'business-radio' },
      attrs: { 'aria-label': '独立选项' },
      global: { provide: { radioGroup: { modelValue: ref(false), name: 'other-group' } } },
    });
    expect(wrapper.get('input').element.checked).toBe(true);
    expect(wrapper.get('input').attributes('name')).toBe('business-radio');
    expect(wrapper.get('input').attributes('aria-label')).toBe('独立选项');
    expect(wrapper.get('.ex-radio').classes()).toContain('ex-radio--small');
  });

  it('Timeline 继续传递方向和连接线，业务插槽读到宿主值', async () => {
    const showLine = ref(true);
    const wrapper = mountHost(
      ['timeline-direction', 'timeline-mode', 'timeline-show-line'],
      probe =>
        h(
          ExTimeline,
          { direction: 'horizontal', mode: 'alternate', showLine: showLine.value },
          () => h(ExTimelineItem, {}, () => probe)
        )
    );
    expect(wrapper.get('.ex-timeline-item').classes()).toContain('ex-timeline-item--horizontal');
    expect(wrapper.get('.ex-timeline-item').classes()).toContain('ex-timeline-item--alternate');
    expect(wrapper.find('.ex-timeline-item__tail-horizontal').exists()).toBe(true);
    showLine.value = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.ex-timeline-item__tail-horizontal').exists()).toBe(false);
  });
});
