import { expect, test } from '@playwright/test';

test('原生文件经过表单快照后仍可读取，替换同名文件会作废原值身份', async ({ page }) => {
  await page.goto('/tests/browser/fixture.html?component=form');
  const result = await page.evaluate(async () => {
    const clonePath = '/src/utils/clone.ts';
    const snapshotPath = '/src/utils/value-snapshot.ts';
    const { deepClone } = (await import(clonePath)) as typeof import('../../src/utils/clone');
    const { equalValueSnapshot } = (await import(
      snapshotPath
    )) as typeof import('../../src/utils/value-snapshot');
    const file = new File(['业务文件甲'], 'same.txt', { lastModified: 1 });
    const replacement = new File(['业务文件乙'], 'same.txt', { lastModified: 1 });
    const snapshot = deepClone({ files: [file] });
    return {
      text: await snapshot.files[0]!.text(),
      size: snapshot.files[0]!.size,
      expectedSize: file.size,
      unchanged: equalValueSnapshot({ files: [file] }, snapshot),
      replaced: equalValueSnapshot(file, replacement),
    };
  });
  expect(result.text).toBe('业务文件甲');
  expect(result.size).toBe(result.expectedSize);
  expect(result.unchanged).toBe(true);
  expect(result.replaced).toBe(false);
});
