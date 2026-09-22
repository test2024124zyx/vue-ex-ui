import { h } from 'vue';
import {
  classNames,
  deepClone,
  deepMerge,
  hasOwnProperty,
  isBoolean,
  isComponent,
  isFunction,
  isNumber,
  isObject,
  isString,
  isVNode,
  styleToString,
} from '../../src/utils';

describe('公共核心工具', () => {
  it('deepClone 支持循环引用、Map、Set、Date 和类实例原型', () => {
    class Model {
      constructor(public value: number) {}
      doubled(): number {
        return this.value * 2;
      }
    }
    interface Source {
      model: Model;
      map: Map<string, { count: number }>;
      set: Set<{ active: boolean }>;
      date: Date;
      self?: Source;
    }
    const source: Source = {
      model: new Model(2),
      map: new Map<string, { count: number }>([['item', { count: 1 }]]),
      set: new Set([{ active: true }]),
      date: new Date('2026-01-01T00:00:00.000Z'),
    };
    source.self = source;

    const cloned = deepClone(source);

    expect(cloned).not.toBe(source);
    expect(cloned.self).toBe(cloned);
    expect(cloned.model).toBeInstanceOf(Model);
    expect(cloned.model.doubled()).toBe(4);
    expect(cloned.map.get('item')).toEqual({ count: 1 });
    expect(cloned.map.get('item')).not.toBe(source.map.get('item'));
    expect([...cloned.set][0]).not.toBe([...source.set][0]);
    expect(cloned.date).not.toBe(source.date);
  });

  it('deepClone 保留内建对象复用关系、共享缓冲区与 RegExp 游标', () => {
    const date = new Date('2026-08-15T00:00:00.000Z');
    const pattern = /ex-ui/giu;
    pattern.lastIndex = 4;
    const buffer = new ArrayBuffer(12);
    const bytes = new Uint8Array(buffer, 0, 6);
    const view = new DataView(buffer, 2, 6);
    bytes.set([1, 2, 3, 4, 5, 6]);
    const sharedBuffer = new SharedArrayBuffer(8);
    const sharedBytes = new Uint8Array(sharedBuffer);
    sharedBytes.set([7, 8, 9]);
    const source = {
      firstDate: date,
      secondDate: date,
      firstPattern: pattern,
      secondPattern: pattern,
      buffer,
      bytes,
      view,
      sharedBuffer,
      sharedBytes,
    };

    const cloned = deepClone(source);

    expect(cloned.firstDate).toBe(cloned.secondDate);
    expect(cloned.firstDate).not.toBe(date);
    expect(cloned.firstPattern).toBe(cloned.secondPattern);
    expect(cloned.firstPattern).not.toBe(pattern);
    expect(cloned.firstPattern.lastIndex).toBe(4);
    expect(cloned.buffer).not.toBe(buffer);
    expect(cloned.bytes.buffer).toBe(cloned.buffer);
    expect(cloned.view.buffer).toBe(cloned.buffer);
    expect([...cloned.bytes]).toEqual([1, 2, 3, 4, 5, 6]);
    expect(cloned.sharedBuffer).toBeInstanceOf(SharedArrayBuffer);
    expect(cloned.sharedBuffer).not.toBe(sharedBuffer);
    expect(cloned.sharedBytes.buffer).toBe(cloned.sharedBuffer);
    expect([...cloned.sharedBytes.slice(0, 3)]).toEqual([7, 8, 9]);
  });

  it('deepClone 保留数组 length 与内建对象自定义属性描述符', () => {
    const items = [{ value: 1 }];
    Object.defineProperty(items, 'length', { writable: false });
    const date = new Date('2026-08-15T00:00:00.000Z') as Date & {
      metadata: { owner: string };
    };
    Object.defineProperty(date, 'metadata', {
      configurable: true,
      enumerable: false,
      value: { owner: 'ExUI' },
      writable: false,
    });

    const cloned = deepClone({ items, date });
    const lengthDescriptor = Object.getOwnPropertyDescriptor(cloned.items, 'length');
    const metadataDescriptor = Object.getOwnPropertyDescriptor(cloned.date, 'metadata');

    expect(cloned.items).toHaveLength(1);
    expect(cloned.items[0]).not.toBe(items[0]);
    expect(lengthDescriptor?.writable).toBe(false);
    expect(cloned.date.metadata).toEqual({ owner: 'ExUI' });
    expect(cloned.date.metadata).not.toBe(date.metadata);
    expect(metadataDescriptor).toMatchObject({ enumerable: false, writable: false });
  });

  it('deepClone 对无法遍历的异步与弱引用容器保持原引用', () => {
    const key = {};
    const weakMap = new WeakMap([[key, { value: 1 }]]);
    const weakSet = new WeakSet([key]);
    const promise = Promise.resolve('done');

    const cloned = deepClone({ weakMap, weakSet, promise });

    expect(cloned.weakMap).toBe(weakMap);
    expect(cloned.weakSet).toBe(weakSet);
    expect(cloned.promise).toBe(promise);
  });

  it('deepMerge 只递归普通对象并阻止原型污染键', () => {
    const originalDate = new Date('2026-01-01T00:00:00.000Z');
    const replacementDate = new Date('2027-01-01T00:00:00.000Z');
    const polluted = JSON.parse('{"__proto__":{"polluted":true}}') as Record<string, unknown>;
    const result = deepMerge(
      { nested: { first: 1 }, date: originalDate },
      { nested: { second: 2 }, date: replacementDate } as never,
      polluted as never
    );

    expect(result.nested).toEqual({ first: 1, second: 2 });
    expect(result.date).toBe(replacementDate);
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect((result as unknown as { polluted?: boolean }).polluted).toBeUndefined();
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
  });

  it('数字和 Vue 组件判断拒绝伪值并接受 setup-only 组件', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNumber(Number.NaN)).toBe(false);
    expect(isComponent({ setup: () => () => null })).toBe(true);
    expect(isComponent({ render: () => null })).toBe(true);
    expect(isComponent({ template: '<div>模板组件</div>' })).toBe(true);
    expect(isComponent({ render: 'not-a-function' })).toBe(false);
    expect(isComponent({ setup: {} })).toBe(false);
    expect(isComponent({ template: '   ' })).toBe(false);
    expect(isComponent({ __file: 'FakeComponent.vue' })).toBe(false);
    expect(isComponent({ arbitrary: true })).toBe(false);
  });

  it('基础类型守卫、VNode 和安全属性检查应该区分边界值', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isFunction(() => undefined)).toBe(true);
    expect(isFunction('function')).toBe(false);
    expect(isString('text')).toBe(true);
    expect(isString(1)).toBe(false);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);

    const vnode = h('span', '文本');
    expect(isVNode(vnode)).toBe(true);
    expect(isVNode({ __v_isVNode: false })).toBe(false);
    expect(isVNode(null)).toBe(false);

    const record = { own: 1 };
    expect(hasOwnProperty(record, 'own')).toBe(true);
    expect(hasOwnProperty(record, 'missing')).toBe(false);
    expect(classNames('a', undefined, null, false, 'b')).toBe('a b');
    expect(styleToString({ backgroundColor: 'red', zIndex: 2 })).toBe(
      'background-color: red; z-index: 2'
    );
  });
});
