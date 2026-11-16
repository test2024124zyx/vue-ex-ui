/** 兼容旧版 npm 的数组和 npm 12 以包名为键的打包清单。 */
export function readPackManifest(output, packageName) {
  const manifest = JSON.parse(output);
  const entry = Array.isArray(manifest)
    ? manifest.find(item => item?.name === packageName)
    : manifest && Object.hasOwn(manifest, packageName)
      ? manifest[packageName]
      : undefined;

  if (
    typeof entry?.filename !== 'string' ||
    !entry.filename ||
    !Array.isArray(entry.files) ||
    entry.files.some(file => typeof file?.path !== 'string' || !file.path)
  ) {
    throw new Error(`npm pack 未返回 ${packageName} 的有效包清单`);
  }
  return entry;
}
