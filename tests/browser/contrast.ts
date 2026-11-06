import type { Locator } from '@playwright/test';

/** 合成实际背景与渐变端点，按相对亮度计算最差对比度，覆盖透明的状态标记。 */
export const contrast = async (foreground: Locator, background?: string, property = 'color') => {
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
      const ink = parse(color);
      ink[3] ??= 1;
      // 半选图标的透明度在外层，必须计入最终状态标记的实际亮度。
      for (
        let current: Element | null = foregroundElement;
        current;
        current = current.parentElement
      )
        ink[3] *= Number(getComputedStyle(current).opacity);
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
