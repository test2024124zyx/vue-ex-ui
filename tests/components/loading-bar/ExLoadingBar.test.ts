import { describe, it, expect } from 'vitest';
import { loadingBar } from '../../../src/components/loading-bar/loading-bar';

describe('ExLoadingBar', () => {
  describe('LoadingBar API', () => {
    it('应该有 start 方法', () => {
      expect(loadingBar.start).toBeDefined();
      expect(typeof loadingBar.start).toBe('function');
    });

    it('应该有 finish 方法', () => {
      expect(loadingBar.finish).toBeDefined();
      expect(typeof loadingBar.finish).toBe('function');
    });

    it('应该有 error 方法', () => {
      expect(loadingBar.error).toBeDefined();
      expect(typeof loadingBar.error).toBe('function');
    });

    it('应该有 update 方法', () => {
      expect(loadingBar.update).toBeDefined();
      expect(typeof loadingBar.update).toBe('function');
    });

    it('应该有 config 方法', () => {
      expect(loadingBar.config).toBeDefined();
      expect(typeof loadingBar.config).toBe('function');
    });

    it('config 应该接受配置选项', () => {
      expect(() => {
        loadingBar.config({
          height: 5,
          color: '#ff0000',
          duration: 2000,
          zIndex: 10000,
        });
      }).not.toThrow();
    });

    it('update 应该接受 0-100 的数值', () => {
      expect(() => {
        loadingBar.update(0);
        loadingBar.update(50);
        loadingBar.update(100);
      }).not.toThrow();
    });
  });
});
