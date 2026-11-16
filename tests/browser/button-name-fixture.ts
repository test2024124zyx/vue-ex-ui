import { createApp, h, ref } from 'vue';
import ExButton from '../../src/components/button/ExButton.vue';
import '../../src/styles/index.scss';
import '../../src/components/button/ExButton.scss';

createApp({
  setup() {
    const label = ref('保存');
    return () =>
      h('main', [
        ...(['primary', 'success', 'warning', 'danger', 'info'] as const).map(type =>
          h(ExButton, { type, 'data-testid': type }, () => label.value)
        ),
        h(ExButton, { type: 'primary', 'data-testid': 'rich' }, () => [
          h('span', { 'aria-hidden': 'true' }, '★'),
          h('span', '提交'),
        ]),
        h(
          ExButton,
          { type: 'primary', 'data-testid': 'labelled', 'aria-label': '提交订单' },
          () => '提交'
        ),
        h(ExButton, { type: 'primary', loading: true, 'data-testid': 'loading' }, () => '保存'),
        h(ExButton, { type: 'primary', disabled: true, 'data-testid': 'disabled' }, () => '保存'),
        h(
          'button',
          {
            id: 'translate',
            onClick: () => {
              label.value = 'Save';
            },
          },
          '切换语言'
        ),
      ]);
  },
}).mount('#app');
