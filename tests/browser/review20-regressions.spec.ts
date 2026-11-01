import { expect, test, type Page, type Route } from '@playwright/test';

const open = async (page: Page, scene: string, query = '') => {
  await page.goto(`/tests/browser/review20-fixture.html?scene=${scene}${query}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#fixture-errors')).toBeEmpty();
};
test.afterEach(async ({ page }) => {
  await expect(page.locator('#fixture-errors')).toBeEmpty();
});

test('整表等待慢字段时已完成字段改值不得放行', async ({ page }) => {
  await open(page, 'form');
  await page.locator('#start-validation').click();
  await expect(page.locator('#validation-result')).toHaveText('等待中');
  await page.locator('input').fill('');
  await expect(page.locator('.ex-form-item__error')).toContainText('必填');
  await page.locator('#finish-validation').click();
  await expect(page.locator('#validation-result')).toHaveText(
    '{"valid":false,"errors":[],"outOfDate":true}'
  );
});

test('真实 XHR 完成回写不会吞掉等待 beforeAdd 的第二个文件', async ({ page }) => {
  let pendingRoute: Route | undefined;
  await page.route('**/review20-upload', route => {
    pendingRoute = route;
  });
  await open(page, 'upload');
  await page.locator('#start-upload').click();
  await expect.poll(() => Boolean(pendingRoute)).toBe(true);
  await page.locator('input[type="file"]').setInputFiles({
    name: 'second.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('第二个文件'),
  });
  await expect(page.locator('#waiting-add')).toHaveText('true');
  await pendingRoute!.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '{"url":"/first.txt"}',
  });
  await expect(page.locator('#file-results')).toContainText('success');
  await page.locator('#finish-add').click();
  await expect(page.locator('#file-results')).toHaveText(
    '[{"name":"first.txt","status":"success"},{"name":"second.txt","status":"ready"}]'
  );
});

test('原生单选、精度、本地错误、Panel、Ellipsis 和动态锚点遵守确认状态', async ({ page }) => {
  await open(page, 'controls');
  await page.locator('#independent-radio label').nth(1).click();
  await expect(page.locator('#independent-radio input').nth(0)).toBeChecked();
  await expect(page.locator('#independent-radio input').nth(1)).not.toBeChecked();
  await expect(page.locator('#large-number input')).toHaveValue('1e+308');
  await page.locator('#local-error label').click();
  await expect(page.locator('#local-error .ex-checkbox__error')).toContainText('本地错误');
  await page.locator('#restore-checkbox').click();
  await expect(page.locator('#local-error .ex-checkbox__error')).toHaveCount(0);
  await page.locator('.ex-panel').scrollIntoViewIfNeeded();
  const panel = (await page.locator('.ex-panel').boundingBox())!;
  // 使用真实鼠标验证禁止点击的行为，不让自动化工具替组件拦截 disabled 语义。
  await page.mouse.click(panel.x + 20, panel.y + 20);
  await expect(page.locator('#panel-clicks')).toHaveText('0');
  await page.locator('#finish-panel').click();
  await page.locator('.ex-panel').click();
  await expect(page.locator('#panel-clicks')).toHaveText('1');
  await page.locator('#release-ellipsis').click();
  await expect(page.locator('.ex-ellipsis')).toHaveClass(/ex-ellipsis--expanded/);
  await page.locator('#add-anchor').click();
  await expect(page.locator('.ex-anchor-link')).toHaveClass(/is-active/);
});

for (const kind of ['select', 'tree-select', 'cascader']) {
  test(`${kind} 重置终止请求，迟到结果不显示，重新打开可继续加载`, async ({ page }) => {
    await open(page, 'selectors', `&kind=${kind}`);
    const show = async () => {
      await page.getByRole('combobox').click();
      if (kind === 'tree-select' && (await page.locator('#request-count').textContent()) === '0')
        await page.locator('.ex-tree-select__expand').click();
      if (kind === 'cascader') await page.locator('.ex-cascader__option').click();
    };
    await show();
    await expect(page.locator('#request-count')).toHaveText('1');
    // 程序化重置不借助外部点击关闭，验证字段的独立重置通知。
    await page.locator('#reset-selector').evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.locator('#abort-count')).toHaveText('1');
    await expect(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    await page.locator('#finish-loads').click();
    await show();
    await expect(page.locator('#request-count')).toHaveText('2');
    await page.locator('#finish-loads').evaluate((button: HTMLButtonElement) => button.click());
    await expect(page.getByText('第2次结果', { exact: true })).toBeVisible();
    await expect(page.getByText('第1次结果', { exact: true })).toHaveCount(0);
  });
}

test('Tree 外部父子联动，原生列拖动隔离跨表并允许本表排序', async ({ page }) => {
  await open(page, 'trees');
  await expect(page.locator('.ex-tree input:checked')).toHaveCount(3);
  await page.locator('#check-children').click();
  await expect(page.locator('.ex-tree input:checked')).toHaveCount(3);
  const source = page.locator('#table-first .ex-table-column-controls__drag').nth(1);
  await source.dragTo(page.locator('#table-second .ex-table-column-controls__drag').first());
  await expect(page.locator('#order-second')).toHaveText('0');
  await source.dragTo(page.locator('#table-first .ex-table-column-controls__drag').first());
  await expect(page.locator('#order-first')).toHaveText('1');
});

for (const modal of [false, true]) {
  test(`Dropdown 的正反向 Tab 沿触发器顺序退出，模态=${modal}`, async ({ page }) => {
    await open(page, 'dropdown', `&modal=${modal}`);
    const trigger = page.locator('#dropdown-trigger');
    for (const reverse of [false, true]) {
      await trigger.focus();
      await trigger.press('ArrowDown');
      await expect(page.getByRole('menu')).toBeFocused();
      await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab');
      await expect(page.locator(reverse ? '#before-dropdown' : '#after-dropdown')).toBeFocused();
      await expect(page.getByRole('menu')).not.toBeVisible();
    }
  });
}

test('通知迁移层级保留正在操作的按钮焦点', async ({ page }) => {
  await open(page, 'services');
  await page.locator('#show-notification').click();
  const close = page.locator('.ex-notification__close');
  await close.focus();
  await page.locator('#raise-layer').evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator('.ex-notification-container')).toHaveCSS('z-index', '5080');
  await expect(close).toBeFocused();
});

test('真实图表公开更新清除空遮罩，图例隐藏项退出键盘导航', async ({ page }) => {
  await open(page, 'chart');
  await expect(page.locator('#chart-ready')).toHaveText('true');
  await expect(page.locator('.ex-chart__empty')).toBeVisible();
  await page.locator('#chart-data').click();
  await expect(page.locator('.ex-chart__empty')).not.toBeVisible();
  await expect(page.locator('.ex-chart__container svg')).toBeVisible();
  await page.locator('#chart-clear').click();
  await expect(page.locator('.ex-chart__empty')).toBeVisible();
  await page.locator('#chart-pie').click();
  await expect(page.getByRole('listbox')).toContainText('显示项');
  await expect(page.getByRole('listbox')).not.toContainText('隐藏项');
});

test('真实图片裁剪重置撤销按住的指针会话', async ({ page }) => {
  await open(page, 'crop');
  const box = page.locator('.ex-image-crop__crop-box');
  await expect(box).toBeVisible();
  const initial = await page.locator('#crop-area').textContent();
  const bounds = (await box.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2 + 10, bounds.y + bounds.height / 2);
  await expect(page.locator('#crop-area')).not.toHaveText(initial!);
  await page.locator('#reset-crop').evaluate((button: HTMLButtonElement) => button.click());
  await page.mouse.move(bounds.x + bounds.width / 2 + 20, bounds.y + bounds.height / 2);
  await page.mouse.up();
  await expect(page.locator('#crop-area')).toHaveText(initial!);
});

for (const kind of ['dropdown', 'popover', 'tooltip']) {
  test(`${kind} 切换触发方式取消旧定时器，Popover 替换按钮后保留关联`, async ({ page }) => {
    await page.clock.install();
    await open(page, 'popups');
    await page.locator(`#${kind}`).evaluate((section, kind) => {
      section
        .querySelector(`.ex-${kind}${kind === 'dropdown' ? '__trigger' : ''}`)!
        .dispatchEvent(new MouseEvent('mouseenter'));
      document.querySelector<HTMLButtonElement>('#click-triggers')!.click();
    }, kind);
    await page.clock.fastForward(200);
    const role = kind === 'dropdown' ? 'menu' : kind === 'tooltip' ? 'tooltip' : 'dialog';
    await expect(page.getByRole(role)).not.toBeVisible();
    if (kind === 'popover') {
      await page.locator('#trigger-popover').click();
      await page.clock.fastForward(200);
      await expect(page.getByRole('dialog')).toBeVisible();
      const id = await page.getByRole('dialog').getAttribute('id');
      await page
        .locator('#replace-popup-trigger')
        .evaluate((button: HTMLButtonElement) => button.click());
      await expect(page.locator('#trigger-popover')).toHaveAttribute('aria-controls', id!);
      await expect(page.locator('#trigger-popover')).toHaveAttribute('aria-expanded', 'true');
    }
  });
}
