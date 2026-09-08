import {
  BrowserImageError,
  assertImagePixelBudget,
  loadBrowserImageResource,
  throwIfImageOperationAborted,
} from '../../utils/image-resource';

const DEFAULT_LOGO_PADDING = 4;
const DEFAULT_LOGO_BACKGROUND = '#ffffff';
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const SVG_STYLE_PROPERTIES = [
  'color',
  'fill',
  'fill-opacity',
  'fill-rule',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
  'stop-color',
  'stop-opacity',
];

interface LogoResource {
  image: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
}

/** Canvas 像素不会触发 DOM 变更，导出前通过精确快照识别重绘。 */
export function getQRCodeLogoPixels(container: HTMLElement | undefined): string | undefined {
  const canvas = container?.querySelector('canvas');
  if (!canvas) return undefined;
  assertImagePixelBudget(canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

/** 允许图标组件的无内容包装层，但不静默丢弃额外文字、兄弟图形或其他 HTML。 */
function findLogo(container: HTMLElement): Element | undefined {
  let current: Element = container;
  while (true) {
    const content = Array.from(current.childNodes).filter(
      node => node.nodeType === 1 || (node.nodeType === 3 && Boolean(node.textContent?.trim()))
    );
    if (current === container && !content.length) return undefined;
    if (content.length !== 1 || !(content[0] instanceof Element)) {
      throw new BrowserImageError(
        'INVALID_SOURCE',
        '二维码 Logo 仅支持单个图片、内联 SVG 或 Canvas'
      );
    }
    const child = content[0];
    if (['img', 'svg', 'canvas'].includes(child.localName)) return child;
    current = child;
  }
}

/** 将内联 SVG 的继承颜色固定到副本，避免脱离 Provider 后变成默认黑色。 */
function serializeSvg(source: SVGSVGElement, size: number): Blob {
  if (source.querySelector('foreignObject')) {
    throw new BrowserImageError('INVALID_SOURCE', '内联 SVG Logo 不支持嵌入 HTML 内容');
  }
  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', SVG_NAMESPACE);
  const viewBox = source
    .getAttribute('viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  const width = viewBox?.[2] || source.getBoundingClientRect().width || size;
  const height = viewBox?.[3] || source.getBoundingClientRect().height || size;
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  const originals = [source, ...source.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  originals.forEach((element, index) => {
    const copy = copies[index] as SVGElement;
    const style = source.ownerDocument.defaultView?.getComputedStyle(element);
    for (const property of SVG_STYLE_PROPERTIES) {
      const value = style?.getPropertyValue(property);
      if (value) copy.style.setProperty(property, value);
    }
    // SVG 作为图片解码时不会可靠加载外部依赖，禁止输出悄悄缺失的资源。
    const href = element.getAttribute('href') || element.getAttribute('xlink:href');
    if (href && !href.startsWith('#') && !href.startsWith('data:')) {
      throw new BrowserImageError('INVALID_SOURCE', '内联 SVG Logo 的外部资源必须先内嵌');
    }
  });
  return new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
}

async function loadLogo(
  element: Element,
  size: number,
  signal: AbortSignal
): Promise<LogoResource> {
  if (element instanceof HTMLCanvasElement) {
    if (!element.width || !element.height) {
      throw new BrowserImageError('INVALID_DIMENSION', 'Logo 画布尺寸不能为空');
    }
    return {
      image: element,
      width: element.width,
      height: element.height,
      dispose: () => undefined,
    };
  }
  const image = element instanceof HTMLImageElement ? element : undefined;
  const source = image
    ? image.currentSrc || image.src
    : serializeSvg(element as SVGSVGElement, size);
  const resource = await loadBrowserImageResource(source, signal, {
    requestInit: {
      credentials: image?.crossOrigin === 'use-credentials' ? 'include' : 'same-origin',
      referrerPolicy: (image?.referrerPolicy as ReferrerPolicy) || 'no-referrer',
    },
  });
  return {
    image: resource.image,
    width: resource.dimension.width,
    height: resource.dimension.height,
    dispose: resource.dispose,
  };
}

/** 图片、内联 SVG 和 Canvas 先合成到临时二维码，加载失败不提交半成品。 */
export async function composeQRCodeLogo(
  canvas: HTMLCanvasElement,
  visibleCanvas: HTMLCanvasElement,
  container: HTMLElement | undefined,
  size: number,
  signal: AbortSignal
): Promise<void> {
  if (!container || size <= 0) return;
  const source = findLogo(container);
  if (!source) return;
  const resource = await loadLogo(source, size, signal);
  try {
    throwIfImageOperationAborted(signal);
    const context = canvas.getContext('2d');
    if (!context) throw new BrowserImageError('ENCODE_FAILED', '无法绘制二维码 Logo');
    const style = container.ownerDocument.defaultView?.getComputedStyle(container);
    const canvasRect = visibleCanvas.getBoundingClientRect();
    const logoRect = container.getBoundingClientRect();
    const scaleX = canvasRect.width > 0 ? canvas.width / canvasRect.width : 1;
    const scaleY = canvasRect.height > 0 ? canvas.height / canvasRect.height : 1;
    const width = (logoRect.width || size) * scaleX;
    const height = (logoRect.height || size) * scaleY;
    const x =
      canvasRect.width > 0
        ? (logoRect.left - canvasRect.left) * scaleX
        : (canvas.width - width) / 2;
    const y =
      canvasRect.height > 0
        ? (logoRect.top - canvasRect.top) * scaleY
        : (canvas.height - height) / 2;
    const padding = (property: string, scale: number) => {
      const value = Number.parseFloat(style?.getPropertyValue(property) || '');
      return (Number.isFinite(value) ? value : DEFAULT_LOGO_PADDING) * scale;
    };
    const left = padding('padding-left', scaleX);
    const right = padding('padding-right', scaleX);
    const top = padding('padding-top', scaleY);
    const bottom = padding('padding-bottom', scaleY);
    const innerWidth = Math.max(0, width - left - right);
    const innerHeight = Math.max(0, height - top - bottom);
    const ratio = Math.min(innerWidth / resource.width, innerHeight / resource.height);
    context.save();
    try {
      const background = style?.backgroundColor;
      context.fillStyle =
        background && background !== 'rgba(0, 0, 0, 0)' ? background : DEFAULT_LOGO_BACKGROUND;
      const radius = Math.max(0, Number.parseFloat(style?.borderTopLeftRadius || '') || 0);
      if (radius && typeof context.roundRect === 'function') {
        context.beginPath();
        context.roundRect(x, y, width, height, Math.min(radius * scaleX, width / 2, height / 2));
        context.fill();
      } else {
        context.fillRect(x, y, width, height);
      }
      if (ratio > 0) {
        context.drawImage(
          resource.image,
          x + left + (innerWidth - resource.width * ratio) / 2,
          y + top + (innerHeight - resource.height * ratio) / 2,
          resource.width * ratio,
          resource.height * ratio
        );
      }
    } finally {
      context.restore();
    }
  } finally {
    resource.dispose();
  }
}
