import { expect, test, type Locator, type Page } from '@playwright/test';

const TEXT_CONTRAST = 4.5;
const CONTROL_CONTRAST = 3;
const GEOMETRY_TOLERANCE = 2;
const THEMES = ['light', 'neon-blue'];
test.setTimeout(60000);

/** 按实际计算样式合成透明背景，并检查渐变各端点中最差的文字对比度。 */
const contrast = async (foreground: Locator, background?: string, property = 'color') => {
  return foreground.evaluate(
    (foregroundElement, options) => {
      const color = getComputedStyle(foregroundElement).getPropertyValue(options.property);
      const element =
        options.background === ':parent'
          ? foregroundElement.parentElement!
          : options.background
            ? document.querySelector(options.background)!
            : foregroundElement;
      const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number);
      const blend = (front: number[], back: number[]) =>
        back.map((value, index) => front[index] * (front[3] ?? 1) + value * (1 - (front[3] ?? 1)));
      const luminance = (rgb: number[]) =>
        rgb.reduce((sum, value, index) => {
          const channel = value / 255;
          const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
          return sum + linear * [0.2126, 0.7152, 0.0722][index];
        }, 0);
      const ancestors: Element[] = [];
      for (let current: Element | null = element; current; current = current.parentElement)
        ancestors.unshift(current);
      let backgrounds = [[255, 255, 255]];
      for (const ancestor of ancestors) {
        const style = getComputedStyle(ancestor);
        backgrounds = backgrounds.map(back => blend(parse(style.backgroundColor), back));
        const stops = style.backgroundImage.match(/rgba?\([^)]+\)/g);
        if (stops)
          backgrounds = backgrounds.flatMap(back => stops.map(stop => blend(parse(stop), back)));
      }
      // 包含组件对文字设置的透明度，避免低对比度被颜色本身掩盖。
      const ink = parse(color);
      ink[3] = (ink[3] ?? 1) * Number(getComputedStyle(foregroundElement).opacity);
      return Math.min(
        ...backgrounds.map(back => {
          const values = [luminance(blend(ink, back)), luminance(back)].sort((a, b) => a - b);
          return (values[1] + 0.05) / (values[0] + 0.05);
        })
      );
    },
    { property, background }
  );
};

const openScene = async (page: Page, component: string, theme: string) => {
  await page.goto(`/tests/browser/fixture.html?component=${component}&theme=${theme}`);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
};

for (const component of [
  'calendar',
  'pagination',
  'alert',
  'notification',
  'code',
  'loading',
  'carousel',
  'chart',
  'color-picker',
  'time-picker',
  'datetime-picker',
]) {
  test(`${component} 双主题实际文字与控件对比度`, async ({ page }) => {
    for (const theme of THEMES) {
      await openScene(page, component, theme);
      if (component === 'color-picker')
        await page.getByRole('button', { name: '主题颜色' }).click();
      if (['time-picker', 'datetime-picker'].includes(component))
        await page.getByRole('combobox').click();
      const selectors: Record<string, string> = {
        calendar: '.ex-calendar__cell[aria-selected="true"] .ex-calendar__date-number',
        pagination: '.ex-pagination__item--active',
        alert: '.ex-alert__title',
        notification: '.ex-notification__title',
        code: '[class^="ex-token-"]',
        loading: '.ex-loading__text',
        carousel:
          '.ex-carousel__indicator:not(.ex-carousel__indicator--active) .ex-carousel__indicator-dot',
        chart: '.ex-chart__container svg text',
        'color-picker': '.ex-color-picker__btn--primary',
        'time-picker': '.ex-time-picker__confirm',
        'datetime-picker': '.ex-datetime-picker__day--selected, .ex-datetime-picker__confirm-btn',
      };
      const elements = page.locator(selectors[component]);
      await expect(elements.first()).toBeVisible();
      for (const element of await elements.all()) {
        const background =
          component === 'loading'
            ? '.ex-loading__mask'
            : component === 'carousel'
              ? ':parent'
              : undefined;
        const property =
          component === 'chart' ? 'fill' : component === 'carousel' ? 'background-color' : 'color';
        // 字体加载后图表会重建 SVG，等待最终节点，仍要求实际配色达到同一标准。
        await expect
          .poll(() => contrast(element, background, property), { message: `${component}/${theme}` })
          .toBeGreaterThanOrEqual(component === 'carousel' ? CONTROL_CONTRAST : TEXT_CONTRAST);
      }
      if (component === 'calendar' || component === 'datetime-picker') {
        const otherMonth = page
          .locator(
            component === 'calendar'
              ? '.ex-calendar__cell--other-month'
              : '.ex-datetime-picker__day--other-month'
          )
          .first();
        await expect(otherMonth).toHaveCSS('opacity', '1');
        const label =
          component === 'calendar' ? otherMonth.locator('.ex-calendar__date-number') : otherMonth;
        expect
          .soft(await contrast(label), `${component}/${theme}/相邻月份`)
          .toBeGreaterThanOrEqual(TEXT_CONTRAST);
      }
    }
  });
}

for (const type of ['info', 'success', 'warning', 'error']) {
  for (const variant of ['standard', 'outlined', 'filled']) {
    test(`Alert ${type}/${variant} 标题与说明文字对比度`, async ({ page }) => {
      for (const theme of THEMES) {
        await openScene(page, `alert&type=${type}&variant=${variant}`, theme);
        await expect(page.locator('.ex-alert__title, .ex-alert__description')).toHaveCount(2);
        for (const element of await page.locator('.ex-alert__title, .ex-alert__description').all())
          expect
            .soft(await contrast(element), `${theme}/${type}/${variant}`)
            .toBeGreaterThanOrEqual(TEXT_CONTRAST);
      }
    });
  }
}

test('裁剪遮罩在宽窄视口覆盖完整编辑区域', async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await openScene(page, 'image-crop', 'light');
    await expect(page.locator('[data-action="crop"]')).toBeEnabled();
    const container = await page.locator('.ex-image-crop__container').boundingBox();
    const mask = await page.locator('.ex-image-crop__mask').boundingBox();
    expect(container).not.toBeNull();
    expect(mask).not.toBeNull();
    for (const key of ['x', 'y', 'width', 'height'] as const)
      expect(Math.abs(container![key] - mask![key])).toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
  }
});

for (const component of ['popover', 'popconfirm', 'tooltip']) {
  test(`${component} 边界夹取后箭头仍指向触发按钮`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const edge of ['left', 'right']) {
      await openScene(page, component, 'light');
      const trigger = page.getByRole('button', { name: '打开操作' });
      await trigger.evaluate((element, side) => {
        const wrapper = element.parentElement!;
        wrapper.style.position = 'fixed';
        wrapper.style.top = '160px';
        wrapper.style[side as 'left' | 'right'] = '12px';
      }, edge);
      if (component === 'tooltip') await trigger.hover();
      else await trigger.click();
      const arrow = page.locator(
        component === 'tooltip' ? '.ex-tooltip__arrow' : '.ex-popover__arrow'
      );
      await expect(arrow).toBeVisible();
      // 模拟业务中的长提示，确保 Tooltip 也真实触发视口夹取与尺寸观察。
      await arrow.locator('..').evaluate(element => {
        (element as HTMLElement).style.minWidth = '280px';
      });
      await expect
        .poll(async () => {
          const pointer = await arrow.boundingBox();
          const button = await trigger.boundingBox();
          return Math.abs(pointer!.x + pointer!.width / 2 - button!.x - button!.width / 2);
        })
        .toBeLessThanOrEqual(GEOMETRY_TOLERANCE);
    }
  });
}

test('验收夹具展示真实图标且窄屏长标题完整换行', async ({ page }) => {
  await openScene(page, 'icon', 'light');
  await expect(page.locator('.ex-icon svg')).toBeVisible();
  await expect(page.locator('.ex-icon--empty')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await openScene(page, 'verification-code', 'light');
  const rightmost = await page.locator('h1').evaluate(element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return Math.max(...Array.from(range.getClientRects(), rect => rect.right));
  });
  expect(rightmost).toBeLessThanOrEqual(390);
});
