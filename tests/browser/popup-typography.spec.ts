import { expect, test } from '@playwright/test';

for (const component of [
  'datetime-picker',
  'time-picker',
  'color-picker',
  'popover',
  'tooltip',
  'dropdown',
  'select',
  'tree-select',
  'cascader',
]) {
  test(`${component} 传送后的面板使用主题字体并支持局部覆盖`, async ({ page }) => {
    test.setTimeout(60000);
    for (const font of ['', 'Arial']) {
      await page.goto(
        `/tests/browser/fixture.html?component=${component}&theme=light${font ? `&font=${font}` : ''}`
      );
      await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
      // 宿主字体故意与组件主题不同，浮层不能退回浏览器或宿主的默认字体。
      await page.locator('body').evaluate(element => {
        element.style.fontFamily = 'serif';
      });
      if (
        ['datetime-picker', 'time-picker', 'select', 'tree-select', 'cascader'].includes(component)
      )
        await page.getByRole('combobox').click();
      else if (component === 'color-picker')
        await page.getByRole('button', { name: '主题颜色' }).click();
      else if (component === 'tooltip')
        await page.getByRole('button', { name: '打开操作' }).hover();
      else await page.getByRole('button', { name: '打开操作' }).click();
      const role =
        component === 'tooltip'
          ? 'tooltip'
          : component === 'dropdown'
            ? 'menu'
            : component === 'select'
              ? 'listbox'
              : component === 'tree-select'
                ? 'tree'
                : 'dialog';
      const panel =
        component === 'cascader' ? page.locator('.ex-cascader__dropdown') : page.getByRole(role);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCSS('font-family', font ? /Arial/ : /JetBrains Mono/);
    }
  });
}
