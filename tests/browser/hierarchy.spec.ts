import { expect, test } from '@playwright/test';

const fixture = '/tests/browser/hierarchy-fixture.html';

test('虚拟树在双主题中通过键盘跳到五千节点末尾并提交真实值', async ({ page }) => {
  for (const theme of ['light', 'neon-blue']) {
    await page.goto(`${fixture}?theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    await page.getByRole('combobox', { name: '虚拟资源树' }).press('ArrowDown');
    await expect(page.getByRole('treeitem').first()).toBeFocused();
    await page.keyboard.press('End');
    const last = page.getByRole('treeitem', { name: '资源节点 4999', exact: true });
    await expect(last).toBeFocused();
    await expect(last).toHaveAttribute('aria-posinset', '5000');
    expect(await page.getByRole('treeitem').count()).toBeLessThan(30);
    await page.keyboard.press('Enter');
    await expect(page.locator('#tree-value')).toHaveText('4999');
    await expect(page.getByRole('combobox', { name: '虚拟资源树' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  }
});

test('异步级联从真实 HTTP 错误恢复并选择两个完整路径', async ({ page }) => {
  let requests = 0;
  await page.route('**/hierarchical-options.json', async route => {
    requests++;
    if (requests === 1) await route.fulfill({ status: 503, body: '暂时不可用' });
    else await route.continue();
  });
  await page.goto(fixture);
  await page.getByRole('combobox', { name: '异步地区路径' }).click();
  await page.getByRole('option', { name: '华北', exact: true }).click();
  await page.getByRole('button', { name: '重试加载', exact: true }).click();
  await page.getByRole('option', { name: '北京市', exact: true }).click();
  await page.getByRole('option', { name: '朝阳区', exact: true }).click();
  await expect(page.locator('#cascader-value')).toHaveText('[["north","beijing","chaoyang"]]');
  await page.getByRole('option', { name: '华东', exact: true }).click();
  await page.getByRole('option', { name: '上海市', exact: true }).click();
  await page.getByRole('option', { name: '浦东新区', exact: true }).click();
  await expect(page.locator('#cascader-value')).toHaveText(
    '[["north","beijing","chaoyang"],["east","shanghai","pudong"]]'
  );
  await expect(page.getByRole('combobox', { name: '异步地区路径' })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  await page.keyboard.press('Escape');
  await page.locator('.ex-cascader__tag-remove').first().click();
  await expect(page.locator('#cascader-value')).toHaveText('[["east","shanghai","pudong"]]');
});

test('390px 屏幕中的异步级联面板保持在视口内并可完成键盘选择', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${fixture}?theme=light`);
  const input = page.getByRole('combobox', { name: '异步地区路径' });
  await input.press('ArrowDown');
  await input.press('ArrowRight');
  await expect(page.getByRole('option', { name: '北京市', exact: true })).toBeVisible();
  await input.press('ArrowRight');
  await expect(page.getByRole('option', { name: '朝阳区', exact: true })).toBeVisible();
  await input.press('Enter');
  await expect(page.locator('#cascader-value')).toHaveText('[["north","beijing","chaoyang"]]');
  const bounds = await page.locator('.ex-cascader__dropdown').boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
