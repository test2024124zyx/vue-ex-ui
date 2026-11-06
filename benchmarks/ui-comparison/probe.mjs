import { createApp, shallowRef, nextTick, onMounted } from 'vue';
import adapter from '@adapter';
import { makeRows, CONFIG } from './workload.mjs';

// 仅计数业务 render 回调，不插桩组件源码；用纯文本列排除按钮和标签的影响。
const params = new URLSearchParams(location.search);
const count = Number(params.get('count') || CONFIG.totalRows);
const virtual = params.get('virtual') === '1';
let calls = 0;
let committedCalls = 0;
const definitions = ['id', 'customer', 'region', 'amount', 'status', 'owner', 'date', 'priority'];
const columns = definitions.map(key => ({
  key,
  title: key,
  width: 140,
  render: row => {
    calls++;
    return String(row[key]);
  },
}));
const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
createApp({
  setup() {
    const data = shallowRef(makeRows(count));
    async function snapshot() {
      await nextTick();
      await frame();
      await frame();
      const delta = calls - committedCalls;
      committedCalls = calls;
      return {
        calls: delta,
        totalCalls: calls,
        dataRows: data.value.length,
        columnCount: definitions.length,
        renderedCustomers: (document.body.innerText.match(/客户 \d{5}/g) || []).length,
        elements: document.querySelectorAll('*').length,
      };
    }
    window.__probe = {
      snapshot,
      async updateOne() {
        const started = performance.now();
        data.value = data.value.map((row, index) =>
          index === 0 ? { ...row, amount: row.amount + 1 } : row
        );
        await nextTick();
        return {
          commitMs: performance.now() - started,
          firstAmount: data.value[0]?.amount,
          ...(await snapshot()),
        };
      },
    };
    onMounted(async () => {
      window.__probeReady = await snapshot();
    });
    return () => adapter.provider('light', () => adapter.table(data.value, columns, virtual));
  },
}).mount('#app');
