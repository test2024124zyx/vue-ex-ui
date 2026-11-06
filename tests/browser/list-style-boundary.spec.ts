import { expect, test } from '@playwright/test';

for (const component of ['breadcrumb', 'menu', 'list', 'file-list', 'file-upload']) {
  test(`${component} 在全站主题中不继承正文列表标记`, async ({ page }) => {
    for (const theme of ['light', 'neon-blue']) {
      await page.goto(`/tests/browser/fixture.html?component=${component}&theme=${theme}`);
      await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
      if (component === 'file-upload') {
        await page.locator('input[type=file]').setInputFiles({
          name: '列表示例.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('真实文件列表项'),
        });
      }
      const items = page.locator('#example li');
      expect(await items.count()).toBeGreaterThan(0);
      const markers = await items.evaluateAll(elements =>
        elements.map(element => getComputedStyle(element, '::before').content)
      );
      expect(markers.every(content => content === 'none' || content === 'normal')).toBe(true);
      // 组件隔离不能破坏页面正文原有的列表装饰。
      const proseMarker = await page.locator('main').evaluate(element => {
        const list = document.createElement('ul');
        const item = document.createElement('li');
        item.textContent = '正文列表';
        list.append(item);
        element.append(list);
        return getComputedStyle(item, '::before').content;
      });
      expect(proseMarker).toBe('""');
    }
  });
}
