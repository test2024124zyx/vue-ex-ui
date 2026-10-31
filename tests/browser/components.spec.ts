import { expect, test, type Locator, type Page } from '@playwright/test';
import { componentDirectories } from '../../src/resolver/component-map';

const modules = [...new Set(componentDirectories.values())];

/** 真实像素必须既有内容又有颜色变化，避免空画布或纯背景通过验收。 */
const expectCanvasDrawing = async (canvas: Locator) => {
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element: HTMLCanvasElement) => {
        if (!element.width || !element.height) return 0;
        const pixels = element
          .getContext('2d')
          ?.getImageData(0, 0, element.width, element.height).data;
        if (!pixels) return 0;
        const colors = new Set<string>();
        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3])
            colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
          if (colors.size > 1) return colors.size;
        }
        return colors.size;
      })
    )
    .toBeGreaterThan(1);
};

const expectLoadedImage = async (image: Locator) => {
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (element: HTMLImageElement) =>
          element.complete && element.naturalWidth > 0 && element.naturalHeight > 0
      )
    )
    .toBe(true);
};

/** 每个模块验证自己的 DOM 与代表内容，Teleport 也必须渲染真实可见的浮层。 */
const expectScene = async (page: Page, component: string) => {
  if (component === 'config-provider') {
    await expect(page.locator('#example [data-ex-provider]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: '局部配置按钮' })).toHaveClass(
      /ex-button--small/
    );
    return;
  }
  if (component === 'popconfirm') {
    await page.getByRole('button', { name: '打开操作' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.ex-popconfirm')).toContainText('确认删除？');
    return;
  }
  const root = page.locator(`.ex-${component}`).first();
  await expect(root).toBeVisible();
  if (component === 'barcode') {
    await expect(root).toHaveAttribute('role', 'img');
    await expect(root.locator('.ex-barcode__error')).toHaveCount(0);
    await expect.poll(() => root.locator('svg rect').count()).toBeGreaterThan(2);
    await expect(root.locator('svg text')).toHaveText('123456789');
  } else if (component === 'qrcode') {
    await expect(root).toHaveAttribute('role', 'img');
    await expect(root.locator('.ex-qrcode__error')).toHaveCount(0);
    await expectCanvasDrawing(root.locator('canvas'));
  } else if (component === 'chart') {
    await expect(root.locator('.ex-chart__container svg')).toBeVisible();
    await expect
      .poll(() => root.locator('.ex-chart__container svg path').count())
      .toBeGreaterThan(2);
    await expect(root.getByRole('listbox')).toBeVisible();
    await expect(root.getByRole('option')).toContainText('甲');
  } else if (component === 'image') {
    await expectLoadedImage(root.locator('img').first());
  } else if (component === 'image-compress') {
    const compressed = root.locator('.ex-image-compress__preview-compressed img');
    await expectLoadedImage(compressed);
    expect(
      await compressed.evaluate((element: HTMLImageElement) => [
        element.naturalWidth,
        element.naturalHeight,
      ])
    ).toEqual([80, 50]);
    await expect(page.locator('#media-result')).toContainText('"bytes":');
  } else if (component === 'image-crop') {
    await expect(root.locator('[data-action="crop"]')).toBeEnabled();
    await expectCanvasDrawing(root.locator('canvas'));
    await root.locator('[data-action="crop"]').click();
    await expect(page.locator('#media-result')).toContainText('"bytes":');
    expect(
      JSON.parse((await page.locator('#media-result').textContent()) ?? '{}').bytes
    ).toBeGreaterThan(0);
  } else if (component === 'file-preview') {
    await expectLoadedImage(root.locator('img').first());
  } else if (component === 'watermark') {
    const overlay = root.locator('.ex-watermark__overlay');
    await expect(overlay).toHaveCSS('background-image', /data:image\/png/);
    await expect
      .poll(() =>
        overlay.evaluate(
          element =>
            new Promise<boolean>(resolve => {
              const source =
                getComputedStyle(element).backgroundImage.match(/url\("([^"]+)"\)/)?.[1];
              if (!source) return resolve(false);
              const image = new Image();
              image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0);
              image.onerror = () => resolve(false);
              image.src = source;
            })
        )
      )
      .toBe(true);
  } else if (['dropdown', 'popover'].includes(component)) {
    await page.getByRole('button', { name: '打开操作' }).click();
    await expect(page.getByRole(component === 'dropdown' ? 'menu' : 'dialog')).toBeVisible();
  } else if (component === 'tooltip') {
    await page.getByRole('button', { name: '打开操作' }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('提示内容');
  } else if (
    ['select', 'tree-select', 'cascader', 'datetime-picker', 'time-picker'].includes(component)
  ) {
    await root.getByRole('combobox').click();
    await expect(root.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    if (component === 'select')
      await expect(page.getByRole('option').first()).toContainText('项目甲');
    else if (component === 'tree-select')
      await expect(page.getByRole('tree')).toContainText('项目');
    else if (component === 'cascader')
      await expect(page.locator('.ex-cascader__dropdown')).toContainText('项目');
    else await expect(page.getByRole('dialog')).toBeVisible();
  } else if (component === 'color-picker') {
    await root.getByRole('button', { name: '主题颜色' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('slider')).toHaveCount(1);
  } else if (component === 'virtual-list') {
    await expect(root.locator('.ex-virtual-list__item')).toHaveCount(2);
    await expect(root).toContainText('项目甲');
    await expect(root).toContainText('项目乙');
  } else if (component === 'table') {
    await expect(root.getByRole('row')).toHaveCount(3);
    await expect(root).toContainText('项目甲');
  } else if (component === 'tree') {
    await expect(root.getByRole('treeitem')).toHaveCount(2);
  } else if (component === 'tabs') {
    await expect(root.getByRole('tab')).toHaveCount(2);
    await expect(root.getByRole('tabpanel', { name: '概览' })).toHaveText('概览内容');
  } else if (component === 'collapse') {
    await root.getByRole('button', { name: '详情' }).click();
    await expect(root.getByRole('region')).toHaveText('项目内容');
  }
};

for (const component of modules) {
  test(`${component} 在真实浏览器完成双主题挂载`, async ({ page }) => {
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    for (const theme of ['light', 'neon-blue']) {
      await page.goto(`/tests/browser/fixture.html?component=${component}&theme=${theme}`);
      await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
      await expect(page.locator('main')).toHaveAttribute('data-component', component);
      await expectScene(page, component);
      await expect(page.locator('#fixture-errors')).toBeEmpty();
      expect(failures).toEqual([]);
    }
  });
}

test('真实输入事件校验数值草稿', async ({ page }) => {
  await page.goto('/tests/browser/fixture.html?component=form');
  await page.getByRole('spinbutton').fill('2');
  await expect(page.locator('#validated-value')).toHaveText('2');
});

test('单选表格的程序化全选保持单选约束', async ({ page }) => {
  await page.goto('/tests/browser/fixture.html?component=table');
  await page.locator('.ex-table tbody label').first().click();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await page.locator('#select-all').click();
  await expect(page.getByRole('radio').first()).toBeChecked();
  await expect(page.getByRole('radio').nth(1)).not.toBeChecked();
  await expect(page.locator('#selected-keys')).toHaveText('["a"]');
});

test('日期和颜色的受控触发器不显示被拒绝的值', async ({ page }) => {
  await page.goto('/tests/browser/fixture.html?component=datetime-picker');
  await page.getByRole('combobox').click();
  await page.locator('[data-date="2024-05-20"]').click();
  await expect(page.getByRole('combobox')).toHaveValue('2024-05-15');
  await page.goto('/tests/browser/fixture.html?component=color-picker');
  await page.getByRole('button', { name: '主题颜色' }).click();
  await page.locator('.ex-color-picker__predefine-item').click();
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ex-color-picker__swatch-inner')).toHaveCSS(
    'background-color',
    'rgb(255, 0, 0)'
  );
});

test('窄屏表单和导航保持在视口内并可通过键盘操作', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const component of ['input', 'select', 'pagination', 'tabs', 'tree-select', 'cascader']) {
    await page.goto(`/tests/browser/fixture.html?component=${component}&size=small`);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      391
    );
  }
  await page.goto('/tests/browser/fixture.html?component=tabs');
  await page.getByRole('tab').first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('全局小尺寸覆盖五个遗漏组件，步骤名称使用中文语言配置', async ({ page }) => {
  for (const component of ['breadcrumb', 'tabs', 'steps', 'pagination', 'heatmap']) {
    await page.goto(`/tests/browser/fixture.html?component=${component}&size=small`);
    await expect(page.locator(`.ex-${component}`).first()).toHaveClass(
      new RegExp(`ex-${component}--small`)
    );
    if (component === 'steps') {
      await expect(page.locator('.ex-steps')).toHaveAttribute('aria-label', '步骤导航');
    }
  }
});
