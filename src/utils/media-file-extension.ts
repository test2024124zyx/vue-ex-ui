const IMAGE_EXTENSIONS = new Set([
  'avif',
  'bmp',
  'gif',
  'ico',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
]);
const VIDEO_EXTENSIONS = new Set(['m4v', 'mp4', 'ogv', 'webm']);
const AUDIO_EXTENSIONS = new Set(['aac', 'flac', 'm4a', 'mp3', 'oga', 'opus', 'wav']);

/** 识别常见媒体扩展名，保留音视频都有可能使用的扩展名为未知。 */
export function getMediaTypeByExtension(
  extension: string
): 'image' | 'video' | 'audio' | undefined {
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  return undefined;
}
