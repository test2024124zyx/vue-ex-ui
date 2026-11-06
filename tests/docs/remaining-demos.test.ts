import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { computed, ref, type Ref } from 'vue';

const document = (name: string): string =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8');

// 执行当前文档自身的状态与事件，避免测试另写一份示例逻辑却漏掉页面错误。
const runPageScript = <T>(name: string, bindings: string): T => {
  const source = document(name).match(/<script setup>\s*([\s\S]*?)<\/script>/)?.[1];
  if (!source) throw new Error(`缺少 ${name} 的页面脚本`);
  const executable = source.replace(/^import[^\n]+\n/gm, '');
  return new Function('ref', 'computed', 'withBase', `${executable}\nreturn { ${bindings} };`)(
    ref,
    computed,
    (path: string) => path
  ) as T;
};

const requiredSections = [
  ['back-top', '形状与尺寸'],
  ['code', '文件名与自定义操作'],
  ['collapse', '禁用与无边框'],
  ['empty', '图片'],
  ['loading', '尺寸与颜色'],
  ['loading', '受控全屏加载'],
  ['loading', '自定义内容'],
  ['loading', '服务'],
  ['loading', 'v-loading'],
  ['loading-bar', '独立服务'],
  ['loading-bar', '声明式组件'],
  ['page-header', '固定页头'],
  ['table', '单选模式'],
  ['table', '禁用某些行的选择'],
  ['tree', '自定义节点内容'],
  ['tree', '虚拟滚动'],
] as const;

const section = (name: string, title: string): string => {
  const source = document(name);
  const start = source.search(new RegExp(`^#{2,3} ${title}$`, 'm'));
  expect(start, `${name} 的 ${title} 章节必须存在`).toBeGreaterThanOrEqual(0);
  return source.slice(start).split(/\n#{2,3} /)[0]!;
};

describe('补齐功能章节的可操作文档演示', () => {
  it.each(requiredSections)('%s 的 %s 同时提供运行演示和折叠代码', (name, title) => {
    const content = section(name, title);
    expect(content).toMatch(/::: raw\s*\n[\s\S]+?\n:::/);
    expect(content).toMatch(/::: details 查看示例代码\s*\n```vue/);
  });

  it('图片成功示例使用已存在的资源，失败示例可主动切换并展示错误反馈', () => {
    const content = section('empty', '图片');
    expect(content).toContain('imageFailed');
    expect(content).toContain('切换损坏图片');
    expect(
      readFileSync(resolve(process.cwd(), 'docs/public/images/empty-cart.svg'), 'utf8')
    ).toContain('<svg');
  });

  it('表格禁选示例拥有明确的不可选数据且与单选状态隔离', () => {
    expect(section('table', '单选模式')).toContain('radioKeys');
    const content = section('table', '禁用某些行的选择');
    expect(content).toContain('disabledKeys');
    expect(content).toContain("record.role !== '法师'");
    expect(content).toContain("role: '法师'");
  });

  it('长表格演示为每次重复的数据分配独立行 key', () => {
    const content = section('table', '最大高度');
    expect(content).not.toContain('[...data, ...data, ...data]');
    expect(content).toContain('key: `${group}-${row.key}`');
  });

  it('虚拟树提供完整数据集，自定义节点提供对应的状态字段', () => {
    expect(section('tree', '虚拟滚动')).toContain('Array.from');
    expect(section('tree', '自定义节点内容')).toContain("status: '已同步'");
  });

  it('服务演示提供关闭与卸载清理，源码不再引用未定义的 fetchData', () => {
    const loading = document('loading');
    const bar = document('loading-bar');
    expect(loading).toContain('onBeforeUnmount');
    expect(loading).toContain('destroyAll');
    expect(bar).not.toContain('fetchData');
    expect(bar).toContain('routeLoadingBar.destroy()');
  });

  it('图片失败后重复点击损坏按钮保留错误反馈，恢复有效图片后可再次演示失败', () => {
    const page = runPageScript<{
      imageUrl: Ref<string>;
      imageFailed: Ref<boolean>;
      changeImage: (broken: boolean) => void;
    }>('empty', 'imageUrl, imageFailed, changeImage');
    page.changeImage(true);
    expect(page.imageUrl.value).toBe('data:image/png;base64,invalid');
    page.imageFailed.value = true;
    page.changeImage(true);
    expect(page.imageFailed.value).toBe(true);
    page.changeImage(false);
    expect(page.imageUrl.value).toBe('/images/empty-cart.svg');
    expect(page.imageFailed.value).toBe(false);
    page.changeImage(true);
    expect(page.imageUrl.value).toBe('data:image/png;base64,invalid');
  });

  it('编辑代码不会改变基础示例，自定义操作输出实际求和结果', () => {
    const page = runPageScript<{
      code: Ref<string>;
      editableCode: Ref<string>;
      runResult: Ref<string>;
      runExample: () => void;
    }>('code', 'code, editableCode, runResult, runExample');
    const original = page.code.value;
    page.editableCode.value = 'const changed = true';
    expect(page.code.value).toBe(original);
    page.runExample();
    expect(page.runResult.value).toBe('运行结果：6');
  });

  it('页头导出包含编辑后的订单标题，返回与面包屑事件有独立反馈', () => {
    const page = runPageScript<{
      orderTitle: Ref<string>;
      orderDownloadUrl: Ref<string>;
      backCount: Ref<number>;
      crumbPath: Ref<string>;
      onBack: () => void;
      onCrumb: (path: string) => void;
    }>('page-header', 'orderTitle, orderDownloadUrl, backCount, crumbPath, onBack, onCrumb');
    page.orderTitle.value = '已修改的订单';
    const payload = page.orderDownloadUrl.value.split(',').slice(1).join(',');
    expect(JSON.parse(decodeURIComponent(payload))).toEqual({ id: 1024, title: '已修改的订单' });
    page.onBack();
    page.onCrumb('/list');
    expect(page.backCount.value).toBe(1);
    expect(page.crumbPath.value).toBe('/list');
  });

  it('长表数据不重复 key，虚拟树包含可到达的最后一项', () => {
    const table = runPageScript<{ scrollData: { key: string }[] }>('table', 'scrollData');
    expect(new Set(table.scrollData.map(row => row.key)).size).toBe(table.scrollData.length);
    const tree = runPageScript<{ largeTree: { key: string }[]; virtualCount: number }>(
      'tree',
      'largeTree, virtualCount'
    );
    expect(tree.largeTree).toHaveLength(tree.virtualCount);
    expect(tree.largeTree.at(-1)?.key).toBe(`file-${tree.virtualCount}`);
  });
});
