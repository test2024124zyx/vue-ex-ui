import { afterEach, describe, expect, it, vi } from 'vitest';
import { Blob as NativeBlob, File as NativeFile } from 'node:buffer';
import { deepClone } from '../../src/utils/clone';
import { equalValueSnapshot } from '../../src/utils/value-snapshot';

afterEach(() => vi.unstubAllGlobals());

describe('二进制表单值和不透明对象的快照', () => {
  it('文件快照保留可读取的原生内容，表单重置后仍能上传', async () => {
    // 使用真正的原生内部槽，避免 DOM 模拟器的普通属性掩盖非法克隆。
    vi.stubGlobal('Blob', NativeBlob);
    vi.stubGlobal('File', NativeFile);
    const file = new NativeFile(['业务文件'], 'report.txt', { type: 'text/plain' });
    const source = { files: [file] };
    const snapshot = deepClone(source);
    expect(snapshot.files).not.toBe(source.files);
    expect(snapshot.files[0]!.name).toBe('report.txt');
    expect(snapshot.files[0]!.size).toBe(file.size);
    expect(await snapshot.files[0]!.text()).toBe('业务文件');
    expect(equalValueSnapshot({ files: [file] }, snapshot)).toBe(true);
  });

  it('原生 Blob 和 File 内容不可通过自有属性比较，替换对象必须作废旧校验', () => {
    vi.stubGlobal('Blob', NativeBlob);
    vi.stubGlobal('File', NativeFile);
    const first = new NativeFile(['甲'], 'same.txt', { lastModified: 1 });
    const second = new NativeFile(['乙'], 'same.txt', { lastModified: 1 });
    expect(equalValueSnapshot(first, second)).toBe(false);
    expect(equalValueSnapshot(new NativeBlob(['甲']), new NativeBlob(['乙']))).toBe(false);
  });

  it('不可枚举的异步与弱引用对象只按身份确认，不能误认为结构相同', () => {
    const values = [Promise.resolve(1), new WeakMap(), new WeakSet()];
    const replacements = [Promise.resolve(2), new WeakMap(), new WeakSet()];
    values.forEach((value, index) => {
      expect(equalValueSnapshot(value, deepClone(value))).toBe(true);
      expect(equalValueSnapshot(value, replacements[index])).toBe(false);
    });
  });

  it('共享缓冲区按字节识别修改，克隆值保持相等', () => {
    const source = new SharedArrayBuffer(2);
    new Uint8Array(source).set([1, 2]);
    const copy = deepClone(source);
    expect(equalValueSnapshot(source, copy)).toBe(true);
    new Uint8Array(copy)[1] = 3;
    expect(equalValueSnapshot(source, copy)).toBe(false);
  });

  it('结构中的独立对象被合并为共享引用时，编辑快照识别关系变化', () => {
    const before = { first: { value: 1 }, second: { value: 1 } };
    const shared = { value: 1 };
    const after = { first: shared, second: shared };
    expect(equalValueSnapshot(before, after)).toBe(false);
    expect(equalValueSnapshot(after, before)).toBe(false);
  });
});
