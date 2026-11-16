import { describe, expect, it } from 'vitest';
import { readPackManifest } from '../../scripts/npm-pack-manifest.mjs';

const packageName = 'vue-ex-ui';
const packEntry = {
  name: packageName,
  filename: 'vue-ex-ui-test.tgz',
  files: [{ path: 'package.json' }, { path: 'dist/ex-ui.js' }],
};
const otherEntry = { name: 'dependency', filename: 'dependency-test.tgz', files: [] };

describe('npm 打包清单兼容性', () => {
  it.each([
    { version: '11', manifest: [otherEntry, packEntry] },
    { version: '12', manifest: { dependency: otherEntry, [packageName]: packEntry } },
  ])('npm $version 根据包名选择正确的清单', ({ manifest }) => {
    expect(readPackManifest(JSON.stringify(manifest), packageName)).toEqual(packEntry);
  });

  it.each([
    { manifest: [otherEntry] },
    { manifest: { dependency: otherEntry } },
    { manifest: { [packageName]: { ...packEntry, filename: '' } } },
    { manifest: { [packageName]: { ...packEntry, files: [{ wrong: 'dist/ex-ui.js' }] } } },
  ])('清单缺少目标包或有效文件时阻止验证', ({ manifest }) => {
    expect(() => readPackManifest(JSON.stringify(manifest), packageName)).toThrow(packageName);
  });
});
