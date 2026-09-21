import { describe, expect, it } from 'vitest';
import { compileString } from 'sass-embedded';
import { resolve } from 'node:path';

describe('静态控件的合成提示契约', () => {
  it('加速提示不覆盖业务 transform，也不创建持久的三维上下文', () => {
    const result = compileString(
      `
      @use 'performance' as p;
      .active { transform: translateX(12px); @include p.gpu-accelerate; }
      .idle { @include p.remove-gpu-accelerate; }
    `,
      { loadPaths: [resolve('src/styles')] }
    );
    expect(result.css).toContain('translateX(12px)');
    expect(result.css).not.toMatch(/translateZ|perspective|backface-visibility/);
    expect(result.css).toContain('will-change: transform');
    expect(result.css).toContain('will-change: auto');
  });
});
