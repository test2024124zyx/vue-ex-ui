import { createApp, h, ref } from 'vue';
import ExCode from '../../src/components/code/ExCode.vue';
import '../../src/styles/index.scss';

const full = Array.from({ length: 1200 }, (_, index) => {
  const label = `L${index + 1}`;
  if (index === 1199) return 'L1200 最后一行';
  return index % 3 === 0 ? `${label} ${'长内容 abc '.repeat(18)}` : `${label}\t短内容`;
}).join('\n');
const editable = ref(full);
const precise = Array.from({ length: 2500 }, (_, index) => `P${index + 1}`).join('\n');

createApp({
  setup: () => () =>
    h('main', { style: 'width: 340px' }, [
      h(ExCode, { id: 'readonly-window', code: full, lineNumbers: true }),
      h(ExCode, {
        id: 'editable-window',
        code: editable.value,
        'onUpdate:code': (value: string) => {
          editable.value = value;
        },
        wrap: true,
        editable: true,
        lineNumbers: true,
        maxHeight: 200,
        style: 'transform: scale(0.8); transform-origin: top left',
      }),
      h(ExCode, { id: 'precise-window', code: precise, wrap: true, maxHeight: 180 }),
      h(ExCode, {
        id: 'narrow-window',
        code: '短行\n'.repeat(600),
        highlightLines: [1],
        maxHeight: 160,
      }),
    ]),
}).mount('#app');
