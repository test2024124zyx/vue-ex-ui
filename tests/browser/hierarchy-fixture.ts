import { createApp, h, nextTick, ref } from 'vue';
import ExConfigProvider from '../../src/components/config-provider';
import ExTreeSelect from '../../src/components/tree-select';
import ExCascader from '../../src/components/cascader';
import type { CascaderLoadData, CascaderPath } from '../../src/components/cascader/types';
import type { TreeSelectValue } from '../../src/components/tree-select/types';
import '../../src/style-full';

const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'neon-blue';
document.documentElement.dataset.theme = theme;
const treeValue = ref<TreeSelectValue>(null);
const selectedPaths = ref<CascaderPath[]>([]);
const NODE_COUNT = 5000;
const treeData = Array.from({ length: NODE_COUNT }, (_, value) => ({
  value,
  label: `资源节点 ${value}`,
}));
const roots = [
  { value: 'north', label: '华北', isLeaf: false },
  { value: 'east', label: '华东', isLeaf: false },
];
// 使用真实同源响应验证取消信号和错误重试，不依赖伪造的组件事件。
const loadData: CascaderLoadData = async (option, { signal }) => {
  const response = await fetch('/docs/public/demo-assets/hierarchical-options.json', { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const branches = await response.json();
  return branches[option.value] ?? [];
};

createApp({
  render: () =>
    h(ExConfigProvider, { theme, locale: 'zh-CN', animation: false }, () =>
      h('main', { class: 'ex-app' }, [
        h('h1', '层级选择器'),
        h('section', [
          h('h2', '大数据树'),
          h(ExTreeSelect, {
            data: treeData,
            virtual: true,
            height: 264,
            itemHeight: 44,
            ariaLabel: '虚拟资源树',
            modelValue: treeValue.value,
            'onUpdate:modelValue': value => {
              treeValue.value = value;
            },
          }),
          h('output', { id: 'tree-value' }, JSON.stringify(treeValue.value)),
        ]),
        h('section', [
          h('h2', '异步多选地区'),
          h(ExCascader, {
            options: roots,
            loadData,
            multiple: true,
            selectedPaths: selectedPaths.value,
            'aria-label': '异步地区路径',
            'onUpdate:selectedPaths': value => {
              selectedPaths.value = value;
            },
          }),
          h('output', { id: 'cascader-value' }, JSON.stringify(selectedPaths.value)),
        ]),
      ])
    ),
}).mount('#app');
void nextTick(() => {
  document.documentElement.dataset.ready = 'true';
});
