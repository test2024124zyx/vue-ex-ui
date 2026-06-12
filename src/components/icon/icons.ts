/**
 * 内置 SVG 图标注册表
 *
 * 所有图标为 24x24 viewBox 的内联 SVG 片段，使用 currentColor 着色，
 * 不依赖任何外部网络资源（替代原先对 api.iconify.design 的运行时请求）。
 *
 * 描边类图标统一包裹在带有 fill="none" / stroke="currentColor" 的 <g> 中，
 * 以覆盖 .ex-icon svg 上的 fill: currentColor 样式。
 */

/** 描边图标包装：统一线宽与端点风格 */
const s = (body: string): string =>
  `<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;

/** 填充图标包装 */
const f = (body: string): string => `<g fill="currentColor" stroke="none">${body}</g>`;

/** 文件类图标：文件轮廓 + 角标文字 */
const fileWithLabel = (label: string): string =>
  s('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>') +
  `<text x="12" y="17.5" text-anchor="middle" font-size="6" font-family="sans-serif" font-weight="bold" fill="currentColor" stroke="none">${label}</text>`;

export const ICONS: Record<string, string> = {
  // ---- 基础操作 ----
  'add-line': s('<path d="M12 5v14M5 12h14"/>'),
  'subtract-line': s('<path d="M5 12h14"/>'),
  'close-line': s('<path d="M6 6l12 12M18 6L6 18"/>'),
  'close-circle-line': s('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  'check-line': s('<path d="M5 12l5 5L20 7"/>'),
  'checkbox-circle-line': s('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
  'check-circle-line': s('<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/>'),
  'checkbox-circle-fill':
    '<path fill="currentColor" stroke="none" fill-rule="evenodd" clip-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm4.3 6.1l-5.3 5.3-2.3-2.3-1.4 1.4 3.7 3.7 6.7-6.7-1.4-1.4z"/>',
  'refresh-line': s('<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/>'),
  'search-line': s('<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/>'),
  'more-fill': f(
    '<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>'
  ),
  'loader-4-line': s('<path d="M12 3a9 9 0 0 1 9 9"/>'),
  'delete-bin-line': s(
    '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v5M14 11v5"/>'
  ),
  'file-copy-line': s(
    '<rect x="9" y="8" width="11" height="13" rx="1"/><path d="M6 16H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>'
  ),
  'external-link-line': s(
    '<path d="M14 5h5v5"/><path d="M19 5l-9 9"/><path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"/>'
  ),

  // ---- 箭头/方向 ----
  'arrow-up-s-line': s('<path d="M7 14l5-5 5 5"/>'),
  'arrow-down-s-line': s('<path d="M7 10l5 5 5-5"/>'),
  'arrow-left-s-line': s('<path d="M14 7l-5 5 5 5"/>'),
  'arrow-right-s-line': s('<path d="M10 7l5 5-5 5"/>'),
  'arrow-left-double-line': s('<path d="M11 7l-5 5 5 5"/><path d="M18 7l-5 5 5 5"/>'),
  'arrow-right-double-line': s('<path d="M13 7l5 5-5 5"/><path d="M6 7l5 5-5 5"/>'),
  'arrow-up-line': s('<path d="M12 19V5"/><path d="M5 12l7-7 7 7"/>'),
  'arrow-down-line': s('<path d="M12 5v14"/><path d="M5 12l7 7 7-7"/>'),
  'arrow-right-line': s('<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>'),
  'arrow-up-down-line': s(
    '<path d="M8 17V7"/><path d="M5 10l3-3 3 3"/><path d="M16 7v10"/><path d="M13 14l3 3 3-3"/>'
  ),
  'sort-asc': s('<path d="M4 6h9M4 12h6M4 18h4"/><path d="M18 18V7"/><path d="M15 10l3-3 3 3"/>'),
  'sort-desc': s('<path d="M4 6h4M4 12h6M4 18h9"/><path d="M18 6v11"/><path d="M15 14l3 3 3-3"/>'),
  'anticlockwise-line': s('<path d="M4 4v6h6"/><path d="M5.5 14a7.5 7.5 0 1 0 1.4-7.9L4 9"/>'),
  'clockwise-line': s('<path d="M20 4v6h-6"/><path d="M18.5 14a7.5 7.5 0 1 1-1.4-7.9L20 9"/>'),

  // ---- 状态/提示 ----
  'error-warning-line':
    s('<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/>') +
    f('<circle cx="12" cy="16.5" r="1.2"/>'),
  'information-line':
    s('<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/>') +
    f('<circle cx="12" cy="7.5" r="1.2"/>'),
  'question-line':
    s(
      '<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 1 1 3.7 2.5c-.8.32-1.1.8-1.1 1.8v.5"/>'
    ) + f('<circle cx="12" cy="17" r="1.2"/>'),

  // ---- 可见性 ----
  'eye-line': s(
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  ),
  'eye-off-line': s(
    '<path d="M4 4l16 16"/><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.5 17.5 0 0 1-2.7 3.6M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
  ),
  'zoom-in-line': s(
    '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/><path d="M8 11h6M11 8v6"/>'
  ),
  'zoom-out-line': s(
    '<circle cx="11" cy="11" r="7"/><path d="M16.5 16.5L21 21"/><path d="M8 11h6"/>'
  ),
  'aspect-ratio-line': s(
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 12h5v3.5h-5z"/>'
  ),

  // ---- 上传/下载 ----
  'upload-2-line': s('<path d="M12 16V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/>'),
  'download-2-line': s('<path d="M12 4v12"/><path d="M6 10l6 6 6-6"/><path d="M4 20h16"/>'),
  'upload-cloud-2-line': s(
    '<path d="M7 17a4.5 4.5 0 0 1-.8-8.9A6 6 0 0 1 18 7.8 4.2 4.2 0 0 1 17.6 16"/><path d="M12 12v9"/><path d="M8.5 15.5L12 12l3.5 3.5"/>'
  ),

  // ---- 媒体/内容 ----
  'time-line': s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  'calendar-line': s(
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/>'
  ),
  'image-line': s(
    '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M4 17l5-5 4 4 3-3 4 4"/>'
  ),
  'music-line': s(
    '<path d="M9 17.5V5l11-2v12.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="15.5" r="2.5"/>'
  ),
  'video-line': s(
    '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10.5l5-3v9l-5-3"/>'
  ),
  'inbox-line': s(
    '<path d="M3 13l3-8h12l3 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5a4 4 0 0 0 8 0h5"/>'
  ),
  'star-line': s(
    '<path d="M12 3l2.7 5.8 6.3.8-4.7 4.3 1.3 6.3L12 17l-5.6 3.2 1.3-6.3L3 9.6l6.3-.8z"/>'
  ),
  'star-fill': f(
    '<path d="M12 3l2.7 5.8 6.3.8-4.7 4.3 1.3 6.3L12 17l-5.6 3.2 1.3-6.3L3 9.6l6.3-.8z"/>'
  ),

  // ---- 文件/目录 ----
  'file-line': s('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
  'file-text-line': s(
    '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>'
  ),
  'file-unknow-line': fileWithLabel('?'),
  'file-pdf-line': fileWithLabel('PDF'),
  'file-word-line': fileWithLabel('DOC'),
  'file-excel-line': fileWithLabel('XLS'),
  'file-ppt-line': fileWithLabel('PPT'),
  'file-zip-line': fileWithLabel('ZIP'),
  'folder-line': s(
    '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>'
  ),
  'folder-open-line': s(
    '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v2"/><path d="M2.5 10h19l-2.2 8.2a1 1 0 0 1-1 .8H5.7a1 1 0 0 1-1-.8z"/>'
  ),

  // ---- 布局/视图 ----
  'grid-line': s('<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>'),
  'table-line': s(
    '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 10h18M3 15h18M9 4v16"/>'
  ),
  'list-check': s('<path d="M4 6h10M4 12h10M4 18h7"/><path d="M15 16.5l2 2 4-4.5"/>'),
  'node-tree': s(
    '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M12 12H6v4M12 12h6v4"/>'
  ),
};

export type BuiltinIconName = keyof typeof ICONS;

/** 获取内置图标的 SVG 内容，未注册时返回空字符串 */
export function getBuiltinIcon(name: string): string {
  return ICONS[name] ?? '';
}
