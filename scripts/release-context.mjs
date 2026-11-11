// 按 SemVer 规则校验版本，防止错误标签或外部事件内容进入发布参数。
const numericIdentifier = '(?:0|[1-9]\\d*)';
const prereleaseIdentifier = '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)';
const semanticVersion = new RegExp(
  `^${numericIdentifier}\\.${numericIdentifier}\\.${numericIdentifier}` +
    `(?:-${prereleaseIdentifier}(?:\\.${prereleaseIdentifier})*)?` +
    '(?:\\+[0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*)?$'
);

export function validateReleaseContext({ event, manifest, lockfile }) {
  const release = event.release;
  if (
    event.action !== 'published' ||
    release?.draft !== false ||
    typeof release.prerelease !== 'boolean'
  ) {
    throw new Error('只允许已发布的 GitHub Release 触发 npm 发布');
  }

  const version = manifest.version;
  if (typeof version !== 'string' || version.trim() !== version || !semanticVersion.test(version)) {
    throw new Error('package.json 版本号必须符合 SemVer');
  }
  if (![version, `v${version}`].includes(release.tag_name)) {
    throw new Error('Release 标签必须与 package.json 版本完全一致');
  }

  // 预发布版本只进入 next，避免意外覆盖用户默认安装的 latest。
  const isPrerelease = version.split('+')[0].includes('-');
  if (release.prerelease !== isPrerelease) {
    throw new Error('GitHub Release 预发布标记与 package.json 版本不一致');
  }
  const lockedPackage = lockfile.packages?.[''];
  if (
    lockfile.name !== manifest.name ||
    lockfile.version !== version ||
    lockedPackage?.name !== manifest.name ||
    lockedPackage.version !== version
  ) {
    throw new Error('锁文件的包名或版本与 package.json 不一致');
  }

  const repositoryUrl = manifest.repository?.url;
  const expectedRepository = `https://github.com/${event.repository.full_name}`;
  if (
    typeof repositoryUrl !== 'string' ||
    repositoryUrl.replace(/^git\+/, '').replace(/\.git$/, '') !== expectedRepository
  ) {
    throw new Error('package.json 仓库地址与当前 GitHub 仓库不一致');
  }
  return isPrerelease ? 'next' : 'latest';
}
