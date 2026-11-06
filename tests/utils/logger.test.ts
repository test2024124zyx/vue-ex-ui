import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLogger } from '../../src/utils/logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('默认调试级别应该输出所有级别并格式化前缀', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logger = createLogger({ prefix: 'Test', level: 'debug' });

    logger.debug('debug message', 1);
    logger.info('info message');
    logger.warn('warn message');
    logger.error('error message');

    expect(debug).toHaveBeenCalledWith('[Test:DEBUG] debug message', 1);
    expect(info).toHaveBeenCalledWith('[Test:INFO] info message');
    expect(warn).toHaveBeenCalledWith('[Test:WARN] warn message');
    expect(error).toHaveBeenCalledWith('[Test:ERROR] error message');
  });

  it('级别过滤应该保留错误并抑制更低级别日志', () => {
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const logger = createLogger({ level: 'error' });

    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');

    expect(debug).not.toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
  });
});
