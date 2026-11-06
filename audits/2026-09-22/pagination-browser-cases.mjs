import assert from 'node:assert/strict';
import { resolve } from 'node:path';

const LAYOUT_SETTLE_FRAMES = 4;
const SUBPIXEL_TOLERANCE = 1;

async function settle(page) {
  await page.evaluate(async frames => {
    await document.fonts.ready;
    for (let index = 0; index < frames; index++) await new Promise(requestAnimationFrame);
  }, LAYOUT_SETTLE_FRAMES);
}

async function inspect(page) {
  await settle(page);
  return page.evaluate(() => {
    const root = document.querySelector('#pagination-container');
    const bounds = root.getBoundingClientRect();
    const buttons = [...root.querySelectorAll('.ex-pagination__items button')];
    return {
      width: bounds.width,
      scrollWidth: document.documentElement.scrollWidth,
      viewport: innerWidth,
      pages: buttons.map(button => button.textContent.trim()).filter(Boolean),
      buttonCount: buttons.length,
      active: root.querySelector('[aria-current="page"]')?.textContent.trim(),
      bounds: buttons.map(button => ({
        left: button.getBoundingClientRect().left - bounds.left,
        right: button.getBoundingClientRect().right - bounds.right,
        width: button.getBoundingClientRect().width,
      })),
      events: window.__audit.snapshot().counter,
    };
  });
}

function assertLayout(result, current, last) {
  assert.ok(result.scrollWidth <= result.viewport, JSON.stringify(result));
  assert.ok(
    result.bounds.every(
      bounds => bounds.left >= -SUBPIXEL_TOLERANCE && bounds.right <= SUBPIXEL_TOLERANCE
    ),
    JSON.stringify(result)
  );
  if (last > 0) {
    assert.equal(result.active, String(current));
    assert.ok(
      result.pages.includes('1') && result.pages.includes(String(last)),
      JSON.stringify(result)
    );
    assert.equal(new Set(result.pages).size, result.pages.length);
  } else {
    assert.equal(result.active, undefined);
    assert.equal(result.pages.length, 0);
  }
}

export async function paginationBrowserCases({ browser, page, mount, check, output, origin }) {
  await check('PAGINATION-ALIGNMENT', '窄容器减少页码后保留左、中、右对齐', async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const samples = [];
    for (const align of ['left', 'center', 'right']) {
      await mount('pagination', {
        total: 1000,
        current: 50,
        containerWidth: '300px',
        showTotal: false,
        align,
      });
      const result = await inspect(page);
      assertLayout(result, 50, 100);
      const left = result.bounds[0].left;
      const right = -result.bounds[result.bounds.length - 1].right;
      const difference = align === 'left' ? left : align === 'right' ? right : left - right;
      assert.ok(Math.abs(difference) <= SUBPIXEL_TOLERANCE, JSON.stringify({ align, left, right }));
      samples.push({ align, left, right });
    }
    return samples;
  });

  await check(
    'PAGINATION-RESPONSIVE',
    '分页在 36 种视口、容器、尺寸和当前位置组合下完整可用',
    async () => {
      const samples = [];
      const layouts = [
        { viewport: 320, containerWidth: '100%' },
        { viewport: 375, containerWidth: '100%' },
        { viewport: 768, containerWidth: '100%' },
        { viewport: 1280, containerWidth: '300px' },
      ];
      for (const size of ['small', 'medium', 'large']) {
        for (const current of [1, 500, 1000]) {
          for (const [index, layout] of layouts.entries()) {
            await page.setViewportSize({ width: layout.viewport, height: 900 });
            await mount('pagination', {
              ...layout,
              size,
              current,
              total: 10000,
              theme: index % 2 ? 'neon-blue' : 'light',
              locale: index % 2 ? 'en-US' : 'zh-CN',
              showSizeChanger: true,
              showQuickJumper: true,
            });
            const result = await inspect(page);
            assertLayout(result, current, 1000);
            assert.equal(result.events, 0);
            samples.push({ size, current, ...layout, ...result });
          }
        }
      }
      await page.screenshot({
        path: resolve(output, 'pagination-narrow-container.png'),
        fullPage: true,
      });
      return samples;
    }
  );

  await check(
    'PAGINATION-RESIZE-FOCUS',
    '只调整容器宽度恢复页码并保持键盘焦点和翻页事件',
    async () => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await mount('pagination', {
        total: 1000,
        current: 50,
        containerWidth: '900px',
        showTotal: false,
      });
      const wide = await inspect(page);
      const adjacent = page.locator('.ex-pagination__items button').filter({ hasText: /^48$/ });
      await adjacent.focus();
      await page.evaluate(() => window.__audit.patch({ containerWidth: '240px' }));
      const narrow = await inspect(page);
      assertLayout(narrow, 50, 100);
      assert.ok(narrow.buttonCount < wide.buttonCount);
      assert.equal(
        await page.evaluate(() => document.activeElement?.getAttribute('aria-current')),
        'page'
      );
      assert.equal(narrow.events, 0);
      await page.locator('.ex-pagination__next').focus();
      await page.keyboard.press('Enter');
      assertLayout(await inspect(page), 51, 100);
      await page.evaluate(() => window.__audit.patch({ containerWidth: '900px' }));
      const restored = await inspect(page);
      assert.equal(restored.buttonCount, wide.buttonCount);
      assert.equal(restored.events, 1);
      return { wide, narrow, restored };
    }
  );

  await check(
    'PAGINATION-TOUCH',
    '触摸目标保持至少 44px，超窄容器仍可访问必要翻页控件',
    async () => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        hasTouch: true,
      });
      const touch = await context.newPage();
      const errors = [];
      touch.on('pageerror', error => errors.push(String(error)));
      try {
        await touch.goto(origin);
        await touch.waitForFunction(() => window.__audit);
        const samples = [];
        for (const size of ['small', 'medium', 'large']) {
          for (const containerWidth of ['100%', '180px']) {
            await touch.evaluate(config => window.__audit.mount('pagination', config), {
              size,
              containerWidth,
              total: 1000,
              current: 50,
              longText: true,
            });
            const result = await inspect(touch);
            assertLayout(result, 50, 100);
            assert.ok(
              result.bounds.every(bounds => bounds.width >= 44),
              JSON.stringify(result)
            );
            await touch.locator('.ex-pagination__next').tap();
            assertLayout(await inspect(touch), 51, 100);
            samples.push({ size, containerWidth, ...result });
          }
        }
        assert.deepEqual(errors, []);
        await touch.screenshot({ path: resolve(output, 'pagination-touch.png'), fullPage: true });
        return samples;
      } finally {
        await context.close();
      }
    }
  );

  await check('PAGINATION-BOUNDARIES', '空数据、单页、禁用及大页码布局保持有效', async () => {
    const samples = [];
    for (const config of [
      { total: 0, current: 0 },
      { total: 1, current: 1 },
      { total: 10000000, current: 500000, disabled: true },
    ]) {
      await mount('pagination', { ...config, containerWidth: '300px' });
      const result = await inspect(page);
      assertLayout(result, config.current, Math.ceil(config.total / 10));
      if (config.disabled)
        assert.equal(await page.locator('.ex-pagination__items button:enabled').count(), 0);
      samples.push(result);
    }
    return samples;
  });
}
