import { describe, expect, it } from 'vitest';
import {
  createTusUrlGuard,
  normalizeTusOptions,
  resolveTusUrl,
  validateTusHeaders,
  validateTusMetadata,
} from '../../../src/components/file-upload/tus-config';

describe('tus 地址、认证与协议参数边界', () => {
  it.each([
    '',
    'javascript:alert(1)',
    'https://user:pass@example.com/upload',
    '/files/#part',
    '/files/\nnext',
  ])('拒绝危险上传地址 %s', value => {
    expect(() => resolveTusUrl(value)).toThrow();
  });

  it('服务器可以使用显式允许的额外来源，不能借路径配置扩大认证信息的发送范围', () => {
    const endpoint = new URL('https://upload.example.com/files/');
    const guard = createTusUrlGuard(endpoint, { allowedOrigins: ['https://storage.example.com'] });
    expect(guard('/files/id')).toBe('https://upload.example.com/files/id');
    expect(guard('https://storage.example.com/id')).toBe('https://storage.example.com/id');
    expect(() => guard('https://other.example.com/id')).toThrow('来源');
    expect(() =>
      createTusUrlGuard(endpoint, { allowedOrigins: ['https://storage.example.com/path'] })
    ).toThrow();
  });

  it.each(['Tus-Resumable', 'Upload-Offset', 'Content-Type', 'Content-Length', 'Host', 'x bad'])(
    '业务不能覆盖协议请求头 %s',
    name => {
      expect(() => validateTusHeaders({ [name]: 'value' })).toThrow();
    }
  );

  it('普通认证头保留，拒绝换行注入与非字符串值', () => {
    expect(validateTusHeaders({ Authorization: 'Bearer current' })).toEqual({
      Authorization: 'Bearer current',
    });
    expect(() => validateTusHeaders({ Authorization: 'a\r\nx-secret: b' })).toThrow();
    expect(() => validateTusHeaders({ Authorization: 1 } as never)).toThrow();
    expect(validateTusHeaders(undefined)).toEqual({});
  });

  it('元数据允许中文字符串但禁止非法键与隐式对象序列化', () => {
    expect(validateTusMetadata({ filename: '照片.png' })).toEqual({ filename: '照片.png' });
    expect(() => validateTusMetadata({ 'bad key': 'x' })).toThrow();
    expect(() => validateTusMetadata({ 'bad,key': 'x' })).toThrow();
    expect(() => validateTusMetadata({ nested: { value: 1 } } as never)).toThrow();
    expect(validateTusMetadata(undefined)).toEqual({});
  });

  it('默认顺序请求不强制分片，重试数组复制后不修改调用方配置', () => {
    expect(normalizeTusOptions()).toEqual({
      chunkSize: Infinity,
      retryDelays: [0, 1000, 3000, 5000],
      resume: true,
    });
    const delays = [100];
    const options = normalizeTusOptions({ chunkSize: 10, retryDelays: delays, resume: false });
    options.retryDelays.push(200);
    expect(delays).toEqual([100]);
    expect(options.resume).toBe(false);
  });
});
