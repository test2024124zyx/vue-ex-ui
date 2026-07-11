import { renderToString } from '@vue/server-renderer';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { generateId, generateRandomId, generateUUID } from '../../src/utils/id';

describe('id utilities', () => {
  it('组件作用域中的 ID 在服务端渲染与客户端首屏保持一致', async () => {
    const Probe = defineComponent({
      setup() {
        const id = generateId('probe');
        return () => h('div', { id });
      },
    });

    const serverHtml = await renderToString(h(Probe));
    const client = mount(Probe);

    expect(serverHtml).toContain(`id="${client.attributes('id')}"`);
  });

  it('组件外生成的 ID 唯一且不包含时间戳', () => {
    const first = generateId('outside');
    const second = generateId('outside');

    expect(first).not.toBe(second);
    expect(first).toMatch(/^outside-\d+$/);
    expect(second).toMatch(/^outside-\d+$/);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1025])(
    '随机 ID 拒绝不安全长度 %s',
    length => {
      expect(() => generateRandomId(length)).toThrow(RangeError);
    }
  );

  it('随机 ID 使用指定长度和安全字符集', () => {
    expect(generateRandomId(32)).toMatch(/^[A-Za-z0-9]{32}$/);
  });

  it('生成符合 RFC 4122 版本与变体位的 UUID v4', () => {
    expect(generateUUID()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});
