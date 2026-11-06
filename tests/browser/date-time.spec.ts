import { expect, test } from '@playwright/test';

const PHONE_VIEWPORT = { width: 390, height: 844 };
const SHORT_VIEWPORT = { width: 390, height: 320 };
const LAYOUT_TOLERANCE_PX = 1;

for (const theme of ['light', 'neon-blue']) {
  test(`${theme} 主题的月选择在窄屏内可用键盘跨年`, async ({ page }) => {
    await page.setViewportSize(PHONE_VIEWPORT);
    await page.goto(`/tests/browser/date-time-fixture.html?type=month&theme=${theme}`);
    const trigger = page.getByRole('combobox', { name: '周期' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-period="2026-10"]')).toBeFocused();
    await page.keyboard.press('PageDown');
    await expect(page.locator('[data-period="2027-10"]')).toBeFocused();
    const panel = await page.locator('.ex-datetime-picker__dropdown').boundingBox();
    expect(panel!.x).toBeGreaterThanOrEqual(0);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(PHONE_VIEWPORT.width + LAYOUT_TOLERANCE_PX);
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveValue('2027-10');
    await expect(page.locator('#date-value')).toHaveText('2027-10-01 00:00:00');
  });
}

test('ISO 周跨年显示与提交使用周年及周一', async ({ page }) => {
  await page.goto('/tests/browser/date-time-fixture.html?type=week');
  const trigger = page.getByRole('combobox', { name: '周期' });
  await expect(trigger).toHaveValue('2020-W53');
  await trigger.click();
  await page.locator('[data-action="next-month"]').click();
  await page.locator('[data-date="2021-01-07"]').click();
  await expect(trigger).toHaveValue('2021-W01');
  await expect(page.locator('#date-value')).toHaveText('2021-01-04 00:00:00');
});

test('范围端点标题不遮挡选中时间，完整确认后更新模型', async ({ page }) => {
  await page.setViewportSize(PHONE_VIEWPORT);
  await page.goto('/tests/browser/date-time-fixture.html');
  await page.getByRole('combobox', { name: '时间范围' }).click();
  await expect(page.locator('.ex-time-picker__confirm')).toBeDisabled();
  await page.locator('[data-unit="h"][data-value="9"]').click();
  await page.locator('[data-endpoint="start"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-endpoint="end"]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.locator('[data-unit="h"][data-value="18"]').click();
  const column = await page.locator('.ex-time-picker__column').first().boundingBox();
  const selected = await page.locator('[data-unit="h"][data-value="18"]').boundingBox();
  expect(selected!.y).toBeGreaterThanOrEqual(column!.y - LAYOUT_TOLERANCE_PX);
  expect(selected!.y + selected!.height).toBeLessThanOrEqual(column!.y + column!.height);
  await page.locator('.ex-time-picker__confirm').click();
  await expect(page.locator('#time-range-value')).toHaveText('["09:00","18:00"]');
});

test('矮屏时间范围能够滚动到确认按钮，逆序范围不提交', async ({ page }) => {
  await page.setViewportSize(SHORT_VIEWPORT);
  await page.goto('/tests/browser/date-time-fixture.html');
  await page.getByRole('combobox', { name: '时间范围' }).click();
  await page.locator('[data-unit="h"][data-value="18"]').click();
  await page.locator('[data-endpoint="end"]').click();
  await page.locator('[data-unit="h"][data-value="9"]').click();
  await expect(page.locator('.ex-time-picker__confirm')).toBeDisabled();
  await page.locator('[data-unit="h"][data-value="20"]').click();
  await page.locator('.ex-time-picker__confirm').scrollIntoViewIfNeeded();
  const panel = await page.locator('.ex-time-picker__panel').boundingBox();
  expect(panel!.y).toBeGreaterThanOrEqual(0);
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(SHORT_VIEWPORT.height + LAYOUT_TOLERANCE_PX);
  await page.locator('.ex-time-picker__confirm').click();
  await expect(page.locator('#time-range-value')).toHaveText('["18:00","20:00"]');
});

test('日期时间禁用时段阻止确认，修正后提交合法值', async ({ page }) => {
  await page.goto('/tests/browser/date-time-fixture.html?type=datetime');
  await page.getByRole('combobox', { name: '周期' }).click();
  await expect(page.locator('.ex-datetime-picker__confirm-btn')).toBeDisabled();
  await page.locator('[data-time-part="hour"]').fill('10');
  await page.locator('[data-time-part="minute"]').focus();
  await page.locator('.ex-datetime-picker__confirm-btn').click();
  await expect(page.locator('#date-value')).toHaveText('2026-10-29 10:00:00');
});
