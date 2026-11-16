/** 将临时链接挂入所属文档，确保浏览器能处理点击，下载开始后清理节点。 */
export function clickDownloadLink(owner: Document, url: string, filename: string): void {
  const link = owner.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.hidden = true;
  owner.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
}
