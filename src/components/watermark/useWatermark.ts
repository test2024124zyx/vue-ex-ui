import { ref, onMounted, onUnmounted, watch, nextTick, toRefs } from 'vue';
import { throttle } from '../../utils/throttle';
import { useEventListener } from '../../composables/useEventListener';
import type { ExWatermarkProps } from './types';

/**
 * 加载图片资源
 * @param src 图片地址
 * @param crossOrigin 跨域设置
 * @returns Promise<HTMLImageElement>
 */
async function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin as HTMLImageElement['crossOrigin'];
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Watermark image load error'));
    img.src = src;
  });
}

/**
 * 检测 Canvas API 支持
 * @returns boolean
 */
function isCanvasSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  } catch (_e) {
    return false;
  }
}

/**
 * 绘制水印瓦片
 * @param props 水印属性
 * @param t 国际化函数
 * @returns Promise<string> 返回 base64 数据 URL
 */
async function drawTile(props: ExWatermarkProps, t: (key: string) => string): Promise<string> {
  // 检测 Canvas 支持
  if (!isCanvasSupported()) {
    if (import.meta.env.DEV) {
      console.warn('Canvas API is not supported in this browser');
    }
    return '';
  }

  // 计算设备像素比
  const dpr = props.dprAware ? Math.max(1, Math.floor(window.devicePixelRatio || 1)) : 1;
  const tileW = props.gapX!;
  const tileH = props.gapY!;

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.width = tileW * dpr;
  canvas.height = tileH * dpr;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn('Failed to get 2D context from canvas');
    }
    return '';
  }

  // 缩放以适配高 DPR 设备
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, tileW, tileH);
  ctx.save();

  // 移动到中心点并旋转
  ctx.translate(tileW / 2, tileH / 2);
  ctx.rotate((props.angle! * Math.PI) / 180);

  // 绘制文本水印
  if (props.type === 'text') {
    ctx.font = `${props.fontWeight} ${props.fontSize}px ${props.fontFamily}`;
    ctx.fillStyle = props.color!;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 使用国际化文本，如果没有提供则使用默认值
    const textContent = props.text || t('watermark.text') || 'Watermark';

    // 判断是否为多行文本
    if (Array.isArray(textContent)) {
      // 多行文本渲染
      const lines = textContent;
      const lineHeight = props.lineHeight!;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = -totalHeight / 2;

      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillText(line, 0, y);
      });
    } else {
      // 单行文本渲染
      ctx.fillText(textContent, 0, 0);
    }
  }
  // 绘制图片水印
  else if (props.imageSrc) {
    try {
      const img = await loadImage(props.imageSrc, props.crossOrigin);
      const w = props.imageWidth!;
      const h = props.imageHeight!;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load watermark image:', error);
      }
      // 图片加载失败时返回空字符串
      ctx.restore();
      return '';
    }
  }

  ctx.restore();

  try {
    return canvas.toDataURL('image/png');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to convert canvas to data URL:', error);
    }
    return '';
  }
}

/**
 * 水印组合式函数
 * @param props 水印属性
 * @param t 国际化函数
 * @param containerRef 容器元素引用
 * @returns 水印控制对象
 */
export function useWatermark(
  props: ExWatermarkProps,
  t: (key: string) => string,
  containerRef?: { value: HTMLElement | null }
) {
  const overlayDataUrl = ref('');
  let mutationObserver: MutationObserver | null = null;
  let overlayElement: HTMLElement | null = null;

  /**
   * 刷新水印
   */
  const refresh = async () => {
    overlayDataUrl.value = await drawTile(props, t);
  };

  // 节流刷新函数
  const throttledRefresh = throttle(refresh, props.throttleMs);

  /**
   * 获取水印的 base64 数据 URL
   */
  const toDataURL = () => overlayDataUrl.value;

  /**
   * 恢复被篡改的水印覆盖层
   */
  const restoreOverlay = () => {
    if (!overlayElement || !containerRef?.value) return;

    // 检查覆盖层是否还在 DOM 中
    if (!containerRef.value.contains(overlayElement)) {
      if (import.meta.env.DEV) {
        console.warn('[ExWatermark] 检测到水印被删除，正在恢复...');
      }
      // 重新添加到容器
      containerRef.value.appendChild(overlayElement);
    }

    // 检查关键样式是否被篡改
    const computedStyle = window.getComputedStyle(overlayElement);
    const expectedDisplay = computedStyle.display;
    const expectedVisibility = computedStyle.visibility;
    const expectedOpacity = computedStyle.opacity;

    if (
      expectedDisplay === 'none' ||
      expectedVisibility === 'hidden' ||
      parseFloat(expectedOpacity) === 0
    ) {
      if (import.meta.env.DEV) {
        console.warn('[ExWatermark] 检测到水印样式被篡改，正在恢复...');
      }
      // 恢复样式
      overlayElement.style.display = '';
      overlayElement.style.visibility = '';
      overlayElement.style.opacity = String(props.opacity);
    }
  };

  /**
   * 启动防篡改保护
   */
  const startAntiTamper = () => {
    if (!props.antiTamper || !containerRef?.value) return;

    // 查找覆盖层元素
    overlayElement = containerRef.value.querySelector('.ex-watermark__overlay');
    if (!overlayElement) return;

    // 创建 MutationObserver 监听 DOM 变化
    mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        // 监听子节点变化（删除）
        if (mutation.type === 'childList') {
          if (mutation.removedNodes.length > 0) {
            // 检查是否删除了水印覆盖层
            mutation.removedNodes.forEach(node => {
              if (
                node === overlayElement ||
                (node instanceof HTMLElement && node.classList.contains('ex-watermark__overlay'))
              ) {
                restoreOverlay();
              }
            });
          }
        }

        // 监听属性变化（样式篡改）
        if (mutation.type === 'attributes' && mutation.target === overlayElement) {
          const attrName = mutation.attributeName;
          if (attrName === 'style' || attrName === 'class') {
            // 延迟检查，避免与正常更新冲突
            setTimeout(restoreOverlay, 0);
          }
        }
      }
    });

    // 开始监听容器和覆盖层
    mutationObserver.observe(containerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[ExWatermark] 防篡改保护已启动');
    }
  };

  /**
   * 停止防篡改保护
   */
  const stopAntiTamper = () => {
    if (mutationObserver) {
      mutationObserver.disconnect();
      mutationObserver = null;
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[ExWatermark] 防篡改保护已停止');
      }
    }
  };

  // 组件挂载时初始化水印
  onMounted(async () => {
    await nextTick();
    await refresh();

    // 启动防篡改保护
    if (props.antiTamper) {
      // 等待 DOM 更新完成
      await nextTick();
      startAntiTamper();
    }
  });

  // 响应式监听窗口大小变化（SSR 环境无 window，需守卫，否则 setup 阶段直接抛错）
  if (props.responsive && typeof window !== 'undefined') {
    useEventListener(window, 'resize', throttledRefresh, { passive: true });
  }

  // 监听 props 变化，优化性能：只监听实际需要的属性
  const {
    type,
    text,
    fontFamily,
    fontSize,
    fontWeight,
    color,
    lineHeight,
    imageSrc,
    imageWidth,
    imageHeight,
    angle,
    gapX,
    gapY,
    dprAware,
  } = toRefs(props);

  watch(
    [
      type,
      text,
      fontFamily,
      fontSize,
      fontWeight,
      color,
      lineHeight,
      imageSrc,
      imageWidth,
      imageHeight,
      angle,
      gapX,
      gapY,
      dprAware,
    ],
    () => {
      refresh();
    },
    { deep: true } // 改为 deep: true 以支持数组变化
  );

  // 监听防篡改开关
  watch(
    () => props.antiTamper,
    newVal => {
      if (newVal) {
        nextTick(() => startAntiTamper());
      } else {
        stopAntiTamper();
      }
    }
  );

  // 组件卸载时清理
  onUnmounted(() => {
    stopAntiTamper();
  });

  return {
    overlayDataUrl,
    refresh,
    toDataURL,
    stopAntiTamper,
  };
}
