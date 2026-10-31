import { expect, test, type Page } from '@playwright/test';
import { contrast } from './contrast';

const TEXT_CONTRAST = 4.5;
const CONTROL_CONTRAST = 3;
const THEMES = ['light', 'neon-blue'];
test.setTimeout(60000);

const open = async (page: Page, component: string, theme: string) => {
  await page.goto(`/tests/browser/fixture.html?component=${component}&theme=${theme}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
};

for (const [component, selector] of [
  ['checkbox', '.ex-checkbox__box:not(.ex-checkbox__box--checked)'],
  ['radio', '.ex-radio__box:not(.ex-radio__box--checked)'],
  ['switch', '.ex-switch__core'],
  ['number-input', '.ex-number-input'],
  ['verification-code', '.ex-verification-code__cell'],
]) {
  test(`${component} 未选中或空值控件边界清晰可辨`, async ({ page }) => {
    for (const theme of THEMES) {
      await open(page, component, theme);
      const control = page.locator(selector).first();
      await expect(control).toBeVisible();
      expect
        .soft(await contrast(control, ':parent', 'border-top-color'), theme)
        .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
    }
  });
}

for (const [scene, selector, property] of [
  ['checkbox', '.ex-checkbox__check-icon', 'color'],
  ['checkbox&indeterminate', '.ex-checkbox__indeterminate-icon', 'color'],
  ['radio', '.ex-radio__dot', 'background-color'],
  ['rate', '.ex-rate__star:not(.is-active) .ex-rate__icon--void .ex-icon', 'color'],
  ['rate&half', '.ex-rate__star.is-half .ex-rate__icon--void .ex-icon', 'color'],
]) {
  test(`${scene} 选中或半选标记保持足够对比度`, async ({ page }) => {
    for (const theme of THEMES) {
      await open(page, scene, theme);
      const mark = page.locator(selector).first();
      await expect(mark).toBeVisible();
      expect
        .soft(await contrast(mark, ':parent', property), theme)
        .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
    }
  });
}

test('开关两种状态的滑钮与滑块完整轨道均清晰可辨', async ({ page }) => {
  for (const theme of THEMES) {
    await open(page, 'switch', theme);
    const thumb = page.locator('.ex-switch__action');
    expect
      .soft(await contrast(thumb, ':parent', 'background-color'), `${theme}/关闭`)
      .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
    await page.locator('.ex-switch').click();
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect
      .soft(await contrast(thumb, ':parent', 'background-color'), `${theme}/开启`)
      .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
    await open(page, 'slider', theme);
    expect
      .soft(
        await contrast(page.locator('.ex-slider__track'), ':parent', 'background-color'),
        `${theme}/轨道`
      )
      .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
    for (const background of ['.ex-slider__track', '.ex-slider__bar'])
      expect
        .soft(
          await contrast(page.locator('.ex-slider__thumb'), background, 'background-color'),
          `${theme}/${background}`
        )
        .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
  }
});

test('两种主题的三级说明文字在所有常用表面满足阅读对比度', async ({ page }) => {
  for (const theme of THEMES) {
    await open(page, 'heatmap', theme);
    for (const surface of ['primary', 'secondary', 'tertiary', 'elevated']) {
      // 模拟业务直接消费公开主题变量，防止局部修复遗漏其他组件的相同底色。
      await page.locator('main').evaluate((element, background) => {
        element.querySelector('[data-contrast-probe]')?.remove();
        const sample = document.createElement('span');
        sample.dataset.contrastProbe = '';
        sample.textContent = '辅助说明文字';
        sample.style.color = 'var(--ex-color-text-tertiary)';
        sample.style.background = `var(--ex-color-bg-${background})`;
        element.appendChild(sample);
      }, surface);
      expect
        .soft(await contrast(page.locator('[data-contrast-probe]')), `${theme}/${surface}`)
        .toBeGreaterThanOrEqual(TEXT_CONTRAST);
    }
    expect
      .soft(await contrast(page.locator('.ex-heatmap__month-slot').first()), theme)
      .toBeGreaterThanOrEqual(TEXT_CONTRAST);
  }
});

test('开关加载图标与内联状态文字在两种状态都可辨认', async ({ page }) => {
  for (const theme of THEMES) {
    for (const checked of [false, true]) {
      await open(page, `switch&loading&inline${checked ? '&checked' : ''}`, theme);
      const spinner = page.locator('.ex-switch__spinner');
      await expect(spinner).toBeVisible();
      expect
        .soft(await contrast(spinner, '.ex-switch__action', 'border-right-color'), theme)
        .toBeGreaterThanOrEqual(CONTROL_CONTRAST);
      expect
        .soft(await contrast(page.locator('.ex-switch__inner-text')), theme)
        .toBeGreaterThanOrEqual(TEXT_CONTRAST);
    }
  }
});

test('日历年视图的今天标记同样使用可读的填充色文字', async ({ page }) => {
  await page.clock.install({ time: new Date(2024, 4, 15, 12) });
  for (const theme of THEMES) {
    await open(page, 'calendar', theme);
    await page.locator('.ex-calendar__mode-btn').filter({ hasText: '年' }).click();
    const today = page.locator('.ex-calendar__year-day--today');
    await expect(today).toBeVisible();
    expect.soft(await contrast(today), theme).toBeGreaterThanOrEqual(TEXT_CONTRAST);
  }
});
