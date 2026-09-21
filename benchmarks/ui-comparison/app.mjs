import { createApp, defineComponent, h, ref, shallowRef, computed, nextTick, onMounted, markRaw } from 'vue';
import adapter from '@adapter';
import { CONFIG, makeRows, selectRows, updateRows, makeFields } from './workload.mjs';
import './style.css';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'page';
const theme = params.get('theme') || 'light';
const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
const painted = async () => { await nextTick(); await frame(); await frame(); };

const App = defineComponent({
  setup() {
    const rows = shallowRef(makeRows(mode === 'virtual' ? CONFIG.virtualRows : CONFIG.totalRows));
    const query = ref('');
    const sort = ref('');
    const page = ref(1);
    const selected = shallowRef([]);
    const customer = ref(null);
    const opened = ref(false);
    const fields = ref(makeFields(false));
    const formRef = ref();
    const mounted = ref(true);
    const validation = ref('未校验');
    const measurements = [];
    const state = computed(() => selectRows(rows.value, {
      query: query.value, sort: sort.value, page: page.value,
      pageSize: mode === 'page' ? CONFIG.pageSize : 0,
    }));
    const options = markRaw(Array.from({ length: CONFIG.optionCount }, (_, index) => ({ label: `客户选项 ${index}`, value: index })));
    const rules = markRaw(Object.fromEntries(Object.keys(fields.value).map(key => [key, [
      { required: true, message: '必填字段', trigger: 'blur' },
      { min: CONFIG.minimumFieldLength, message: '至少三个字符', trigger: 'blur' },
    ]])));
    const setSelected = (id, checked) => {
      selected.value = checked ? [...selected.value, id] : selected.value.filter(value => value !== id);
    };
    const columns = markRaw([
      { key: 'selection', title: '选择', width: 64, render: row => adapter.checkbox(selected.value.includes(row.id), value => setSelected(row.id, value)) },
      ...[
        ['id', '编号', 70], ['customer', '客户', 140], ['region', '地区', 90], ['amount', '金额', 100],
        ['status', '状态', 120], ['owner', '负责人', 120], ['date', '日期', 140], ['priority', '优先级', 100],
      ].map(([key, title, width]) => ({ key, title, width, render: row => key === 'status' ? adapter.tag(row[key]) : String(row[key]) })),
      { key: 'actions', title: '操作', width: 100, render: () => adapter.button('编辑', () => { opened.value = true; }) },
    ]);

    async function measure(name, operation, started = performance.now()) {
      const result = await operation();
      await nextTick();
      const committed = performance.now();
      await frame();
      await frame();
      measurements.push({ name, commitMs: committed - started, paintMs: performance.now() - started });
      return result;
    }

    async function validate() {
      validation.value = await adapter.validate(formRef.value) ? '校验通过' : '校验失败';
    }

    // 自动化与可见按钮调用同一业务路径，既检查结果，也记录更新到绘制机会的延迟。
    const actions = {
      sort: () => measure('sort', () => { sort.value = sort.value === 'asc' ? 'desc' : 'asc'; }),
      filter: value => measure('filter', () => { query.value = value; page.value = 1; }),
      nextPage: () => measure('page', () => { page.value = page.value === 1 ? 2 : 1; }),
      update: () => measure('update', () => { rows.value = updateRows(rows.value, CONFIG.batchSize); }),
      select: () => measure('selection', () => { setSelected(state.value.rows[0].id, !selected.value.includes(state.value.rows[0].id)); }),
      open: () => measure('modalOpen', () => { opened.value = true; }),
      close: () => measure('modalClose', () => { opened.value = false; }),
      validate: () => measure('validate', validate),
      fill: valid => measure('formFill', () => { fields.value = makeFields(valid); }),
      unmount: () => measure('unmount', () => { mounted.value = false; opened.value = false; }),
      remount: () => measure('remount', () => { mounted.value = true; }),
      snapshot: () => ({ mode, library: adapter.name, total: state.value.total, visibleData: state.value.rows.length,
        first: state.value.rows[0], last: state.value.rows.at(-1), selected: [...selected.value], opened: opened.value, validation: validation.value,
        fields: { ...fields.value }, customer: customer.value, measurements: [...measurements] }),
    };
    window.__bench = actions;
    // 原生事件路径从捕获阶段计时，下一任务等待 Vue 更新与浏览器绘制机会。
    for (const type of ['input', 'click']) {
      document.addEventListener(type, event => {
        const target = event.target;
        const name = type === 'input'
          ? target.closest('[data-select]') ? 'selectSearch' : target.closest('.search') ? 'searchInput' : target.closest('.form-grid') ? 'fieldInput' : null
          : target.closest('[data-select]') ? 'selectOpen' : null;
        if (!name) return;
        const started = performance.now();
        setTimeout(() => { void measure(name, () => {}, started); }, 0);
      }, true);
    }
    onMounted(async () => {
      await painted();
      window.__ready = { at: performance.now(), mode, library: adapter.name, virtualSupported: adapter.virtualSupported };
    });

    const renderForm = () => adapter.form(formRef, fields.value, rules, () => [
      h('div', { class: 'form-grid' }, Object.keys(fields.value).map((key, index) => adapter.formItem(key, `业务字段 ${index + 1}`,
        () => adapter.input(fields.value[key], value => { fields.value[key] = value; }, { 'data-field-input': key })))),
      h('div', { class: 'form-actions' }, [
        adapter.button('校验表单', actions.validate, { 'data-action': 'validate' }),
        adapter.button('填充有效资料', () => actions.fill(true), { 'data-action': 'fill' }),
        adapter.button('关闭表单', actions.close, { 'data-action': 'close' }),
      ]),
      h('output', { id: 'validation-result' }, validation.value),
    ]);

    return () => adapter.provider(theme, () => h('main', {}, [
      h('h1', {}, `${adapter.name} 客户订单管理`),
      h('div', { class: 'summary' }, [h('div', {}, `订单总数：${rows.value.length}`), h('div', {}, `匹配订单：${state.value.total}`), h('div', {}, `已选订单：${selected.value.length}`)]),
      h('div', { class: 'toolbar' }, [
        h('div', { class: 'search' }, [adapter.input(query.value, value => { query.value = value; page.value = 1; }, { placeholder: '搜索客户', 'data-search': '' })]),
        adapter.button('金额排序', actions.sort, { 'data-action': 'sort' }),
        adapter.button('更新一百行', actions.update, { 'data-action': 'update' }),
        adapter.button('新建订单', actions.open, { 'data-action': 'open' }),
        h('div', { class: 'customer-select', 'data-select': '' }, [adapter.select(customer.value, value => { customer.value = value; }, options)]),
      ]),
      mounted.value ? h('section', { class: 'table-zone', 'data-table': '' }, [adapter.table(state.value.rows, columns, mode === 'virtual')]) : null,
      h('div', { class: 'footer' }, [
        adapter.button('切换页码', actions.nextPage, { 'data-action': 'page' }),
        h('span', {}, `第 ${page.value} 页；本页数据 ${state.value.rows.length} 条`),
      ]),
      adapter.modal(opened.value, value => { opened.value = value; }, renderForm),
    ]));
  },
});

createApp(App).mount('#app');
