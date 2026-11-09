import { createApp, h, ref } from 'vue';
import ExRadio from '../../src/components/radio/ExRadio.vue';
import ExRadioGroup from '../../src/components/radio/ExRadioGroup.vue';
import ExCheckbox from '../../src/components/checkbox/ExCheckbox.vue';
import ExCheckboxGroup from '../../src/components/checkbox/ExCheckboxGroup.vue';
import '../../src/styles/index.scss';

declare global {
  interface Window {
    choiceLayout: { initialFooterTop: number; ready: boolean };
  }
}

const params = new URLSearchParams(location.search);
const size = (params.get('size') ?? 'medium') as 'small' | 'medium' | 'large';
const layout = params.get('layout');
const options =
  layout === 'wrap'
    ? ['跟随设备的辅助功能设置', '进一步减少界面动态效果', '使用更清晰的反馈方式']
    : ['跟随系统', '减少动态效果'];
const radioValue = ref(0);
const checkboxValue = ref<(string | number)[]>([0]);
const groupProps = { size, vertical: layout === 'vertical', label: '显示偏好' };
document.documentElement.dataset.theme = params.get('theme') ?? 'light';

createApp({
  setup: () => () => [
    h('div', { style: { height: layout === 'offscreen' ? '200vh' : '0' } }),
    h('main', { style: { padding: '24px' } }, [
      params.get('kind') === 'checkbox'
        ? h(
            ExCheckboxGroup,
            {
              ...groupProps,
              modelValue: checkboxValue.value,
              'onUpdate:modelValue': value => {
                checkboxValue.value = value;
              },
            },
            () => options.map((label, value) => h(ExCheckbox, { label, value }))
          )
        : h(
            ExRadioGroup,
            {
              ...groupProps,
              modelValue: radioValue.value,
              'onUpdate:modelValue': value => {
                radioValue.value = Number(value);
              },
            },
            () => options.map((label, value) => h(ExRadio, { label, value }))
          ),
      h('p', { id: 'following-content' }, '后续内容的位置应在首次布局时确定'),
    ]),
  ],
}).mount('#app');

// 在浏览器判定自动可见性之前记录后续内容位置，捕获预估高度被真实高度替换的偏移。
window.choiceLayout = {
  initialFooterTop: document.querySelector<HTMLElement>('#following-content')!.offsetTop,
  ready: false,
};
requestAnimationFrame(() =>
  requestAnimationFrame(() => {
    window.choiceLayout.ready = true;
  })
);
