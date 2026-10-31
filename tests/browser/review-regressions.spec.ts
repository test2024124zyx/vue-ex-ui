import { expect, test, type Locator, type Page, type Route } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const open = async (page: Page, scenario: string) => {
  await page.goto(`/tests/browser/review-fixture.html?scenario=${scenario}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#fixture-errors')).toBeEmpty();
};

test('原生输入、单选和滑块保持父级拒绝后的确认值，数值溢出不进入模型', async ({ page }) => {
  await open(page, 'controls');
  const input = page.locator('#controlled-input input');
  await input.fill('拒绝值');
  await expect(input).toHaveValue('确认值');
  await page.locator('#controlled-input .ex-input__action--clear').click();
  await expect(input).toHaveValue('确认值');
  await page.locator('#controlled-radio label').nth(1).click();
  await expect(page.locator('#controlled-radio input').nth(0)).toBeChecked();
  await expect(page.locator('#controlled-radio input').nth(1)).not.toBeChecked();
  const slider = page.locator('#controlled-slider [role="slider"]');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '10');
  await expect(page.locator('#controlled-slider input')).toHaveValue('10');
  const number = page.locator('#finite-number input');
  await number.fill('9'.repeat(309));
  await number.blur();
  await expect(number).toHaveValue('7');
});

test('表单重置清除本地错误并撤销验证码自动提交', async ({ page }) => {
  await open(page, 'reset');
  const clockStart = new Date('2026-11-01T00:00:00+08:00');
  await page.clock.install({ time: clockStart });
  // 暂停业务时钟，避免 Firefox 的滚动和点击耗时让提交在重置前已合法发生。
  await page.clock.pauseAt(new Date(clockStart.getTime() + 1000));
  await page.getByText('触发错误', { exact: true }).click();
  await page.locator('.ex-radio-group label').filter({ hasText: '乙' }).click();
  await expect(page.locator('.ex-checkbox__error')).toContainText('本地错误');
  await expect(page.locator('.ex-radio-group__error')).toContainText('单选错误');
  await page.locator('.ex-verification-code input').fill('123456');
  await page.locator('#reset-form').click();
  await page.clock.fastForward(1200);
  await expect(page.locator('.ex-checkbox__error, .ex-radio-group__error')).toHaveCount(0);
  await expect(page.locator('.ex-verification-code input')).toHaveValue('');
  await expect(page.locator('#submit-count')).toHaveText('0');
});

test('程序化重置不依赖失焦，撤销标签草稿及仍按住鼠标的滑块拖动', async ({ page }) => {
  await open(page, 'reset');
  await page.locator('.ex-tag-input__button').click();
  await page.locator('.ex-tag-input__input').fill('旧草稿');
  await page.locator('#reset-form').evaluate((button: HTMLButtonElement) => button.click());
  await expect(page.locator('.ex-tag-input__input')).toHaveCount(0);
  const track = await page.locator('.ex-slider__track-wrapper').boundingBox();
  const thumb = await page.locator('.ex-slider [role="slider"]').boundingBox();
  await page.mouse.move(thumb!.x + thumb!.width / 2, thumb!.y + thumb!.height / 2);
  await page.mouse.down();
  await page.mouse.move(track!.x + track!.width * 0.8, track!.y + track!.height / 2);
  await expect(page.locator('.ex-slider [role="slider"]')).not.toHaveAttribute('aria-valuenow', '10');
  await page.locator('#reset-form').evaluate((button: HTMLButtonElement) => button.click());
  await page.mouse.move(track!.x + track!.width * 0.9, track!.y + track!.height / 2);
  await page.mouse.up();
  await expect(page.locator('.ex-slider [role="slider"]')).toHaveAttribute('aria-valuenow', '10');
});

test('分页等待容量确认，空跳页恢复原值，锚点和浮层语义随实际状态更新', async ({ page }) => {
  await open(page, 'navigation');
  await page.locator('#page-four').click();
  await page.locator('#partial-pagination select').selectOption('20');
  await expect(page.locator('#partial-pagination [aria-current="page"]')).toHaveText('4');
  await page.locator('#accept-size').click();
  await expect(page.locator('#partial-pagination [aria-current="page"]')).toHaveText('2');
  const jumper = page.locator('#empty-jump input');
  await jumper.fill('');
  await jumper.press('Enter');
  await expect(jumper).toHaveValue('5');
  await page.locator('#tooltip-trigger').click();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await page.locator('#change-description').click();
  await expect(page.locator('#tooltip-trigger')).toHaveAttribute('aria-describedby', /当前错误.*ex-tooltip/);
  await page.locator('#tooltip-trigger').click();
  await expect(page.locator('#tooltip-trigger')).toHaveAttribute('aria-describedby', '当前错误');
  await page.locator('#menu-trigger').press('ArrowDown');
  await expect.poll(() => page.getByRole('menu').evaluate(menu => document.getElementById(menu.getAttribute('aria-activedescendant') ?? '')?.textContent)).toBe('可用项');
  await page.keyboard.press('Escape');
  await page.locator('#jump-anchor').click();
  await expect(page.locator('#anchor-nav a[href="#anchor-second"]')).toHaveClass(/is-active/);
});

test('静态循环数据可用，全部子项选中时父项全选，跨树拖拽不误报节点', async ({ page }) => {
  await open(page, 'trees');
  await expect(page.locator('#cyclic-tree [role="treeitem"]')).toHaveCount(2);
  await page.locator('#cyclic-cascader input').fill('合法');
  await expect(page.locator('.ex-cascader__dropdown')).toContainText('合法子项');
  await page.keyboard.press('Escape');
  await page.locator('#checked-parent [role="combobox"]').click();
  await expect(page.getByRole('tree', { name: '请选择', exact: true }).getByRole('treeitem').first()).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  const dragEvents = await page.evaluateHandle(() => {
    const events: unknown[] = [];
    for (const node of document.querySelectorAll('#drag-source [draggable], #drag-target [draggable]')) {
      for (const type of ['dragstart', 'dragenter', 'dragover', 'drop', 'dragend']) {
        node.addEventListener(type, event => {
          const transfer = (event as DragEvent).dataTransfer;
          events.push({ type, node: node.getAttribute('data-node-key'), value: transfer?.getData('text/plain'), token: transfer?.getData('application/x-ex-ui-tree') });
        });
      }
    }
    return events;
  });
  const target = page.locator('#drag-target [data-node-key="target"]');
  const drag = async (source: Locator) => {
    // 两次移入确保各浏览器都先触发 dragenter，再触发决定放置位置的 dragover。
    await source.hover();
    await page.mouse.down();
    await target.hover();
    await target.hover();
    await page.mouse.up();
  };
  await drag(page.locator('#drag-source [data-node-key="same"]'));
  await expect(page.locator('#drop-results')).toHaveText('[]');
  await drag(page.locator('#drag-target [data-node-key="same"]'));
  await expect(page.locator('#drop-results'), JSON.stringify(await dragEvents.jsonValue())).toHaveText('["当前节点"]');
  await dragEvents.dispose();
});

test('动态列表原地重排后按新高度滚动，ISO 周键盘跨周年移动', async ({ page }) => {
  await open(page, 'virtual');
  await page.locator('#scroll-second').click();
  await expect(page.locator('.ex-virtual-list__item').first()).toHaveText('b');
  await page.locator('#reverse-rows').click();
  await page.locator('#scroll-second').click();
  await expect.poll(() => page.locator('.ex-virtual-list__wrapper').evaluate(element => element.scrollTop)).toBeGreaterThanOrEqual(400);
  await page.goto('/tests/browser/date-time-fixture.html?type=week');
  await page.getByRole('combobox', { name: '周期' }).click();
  await page.locator('[data-date="2020-12-28"]').focus();
  await page.keyboard.press('Home');
  await expect(page.locator('[data-date="2020-12-28"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-date="2021-01-04"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#date-value')).toContainText('2021-01-04');
});

test('服务浮层跟随局部层级变化，显式默认值仍可覆盖继承值', async ({ page }) => {
  await open(page, 'services');
  await page.locator('#open-services').click();
  await page.locator('#raise-services').click();
  await expect(page.locator('.ex-message-container')).toHaveCSS('z-index', '5080');
  await expect(page.locator('.ex-notification')).toHaveCSS('z-index', '5080');
  await expect(page.locator('.ex-loading')).toHaveCSS('z-index', '5100');
  await expect(page.locator('.ex-loading-bar')).toHaveCSS('z-index', '5100');
  await page.locator('#explicit-services').click();
  await expect(page.locator('.ex-message-container')).toHaveCSS('z-index', '2000');
  await expect(page.locator('.ex-notification').filter({ hasText: '显式通知' })).toHaveCSS('z-index', '2000');
});

test('真实上传重置终止请求，下载切换配置仍保存原任务文件名和内容', async ({ page }) => {
  let uploadRoute: Route | undefined;
  let downloadRoute: Route | undefined;
  await page.route('**/acceptance-upload', route => { uploadRoute = route; });
  await page.route('**/acceptance-download/old.txt', route => { downloadRoute = route; });
  await open(page, 'files');
  await page.locator('#start-upload').click();
  await expect.poll(() => Boolean(uploadRoute)).toBe(true);
  await expect(page.locator('#upload-status')).toHaveText('uploading');
  await page.locator('#reset-upload').click();
  await uploadRoute!.fulfill({ status: 200, contentType: 'application/json', body: '{"url":"/old-file"}' });
  await expect(page.locator('#upload-status')).toHaveText('ready');
  await expect(page.locator('#upload-success')).toHaveText('0');
  await page.locator('#snapshot-download .ex-file-download button').click();
  await expect.poll(() => Boolean(downloadRoute)).toBe(true);
  await page.locator('#switch-download').click();
  const result = page.waitForEvent('download');
  await downloadRoute!.fulfill({ status: 200, contentType: 'text/plain', body: '原始下载内容' });
  const download = await result;
  expect(download.suggestedFilename()).toBe('old.txt');
  expect(await readFile((await download.path())!, 'utf8')).toBe('原始下载内容');
});
