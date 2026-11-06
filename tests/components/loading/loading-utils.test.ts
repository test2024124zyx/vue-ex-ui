import { afterEach, describe, expect, it } from 'vitest';
import {
  acquireLoadingTargetPosition,
  normalizeLoadingColor,
  normalizeLoadingSize,
  normalizeLoadingType,
  normalizeLoadingZIndex,
  resolveLoadingTarget,
} from '../../../src/components/loading/loading-utils';

describe('Loading 工具函数', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('有限集合输入只保留真实实现值', () => {
    expect(normalizeLoadingType('dots')).toBe('dots');
    expect(normalizeLoadingType('wave')).toBe('spinner');
    expect(normalizeLoadingType(undefined)).toBe('spinner');
    expect(normalizeLoadingSize('large')).toBe('large');
    expect(normalizeLoadingSize('huge')).toBe('medium');
  });

  it('颜色与层级输入会清理空白并拒绝非有限值', () => {
    expect(normalizeLoadingColor('  #29abe2  ')).toBe('#29abe2');
    expect(normalizeLoadingColor('   ')).toBeUndefined();
    expect(normalizeLoadingColor(undefined)).toBeUndefined();
    expect(normalizeLoadingZIndex(1000.8)).toBe(1000);
    expect(normalizeLoadingZIndex(-1)).toBe(0);
    expect(normalizeLoadingZIndex(Number.NaN)).toBeUndefined();
  });

  it('解析 HTMLElement 与安全选择器，并拒绝缺失或非法目标', () => {
    const host = document.createElement('section');
    host.id = 'target';
    document.body.append(host);

    expect(resolveLoadingTarget(host)).toBe(host);
    expect(resolveLoadingTarget('#target')).toBe(host);
    expect(resolveLoadingTarget('  #target  ')).toBe(host);
    expect(resolveLoadingTarget('#missing')).toBeNull();
    expect(resolveLoadingTarget('')).toBeNull();
    expect(resolveLoadingTarget('[')).toBeNull();
    expect(resolveLoadingTarget()).toBeNull();
  });

  it('静态目标使用引用计数管理临时 relative 定位', () => {
    const host = document.createElement('section');
    document.body.append(host);
    const releaseFirst = acquireLoadingTargetPosition(host);
    const releaseSecond = acquireLoadingTargetPosition(host);

    expect(host.style.position).toBe('relative');
    releaseFirst();
    expect(host.style.position).toBe('relative');
    releaseFirst();
    expect(host.style.position).toBe('relative');
    releaseSecond();
    expect(host.style.position).toBe('');
  });

  it('不会改写已有定位，也不会覆盖持有期间的外部样式更新', () => {
    const positioned = document.createElement('section');
    positioned.style.position = 'absolute';
    document.body.append(positioned);
    const releasePositioned = acquireLoadingTargetPosition(positioned);
    expect(positioned.style.position).toBe('absolute');
    releasePositioned();
    expect(positioned.style.position).toBe('absolute');

    const changed = document.createElement('section');
    document.body.append(changed);
    const releaseChanged = acquireLoadingTargetPosition(changed);
    changed.style.position = 'fixed';
    releaseChanged();
    expect(changed.style.position).toBe('fixed');
  });
});
