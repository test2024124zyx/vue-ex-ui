import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateReleaseContext } from './release-context.mjs';

const createContext = (version = '3.0.0') => ({
  event: {
    action: 'published',
    release: { draft: false, prerelease: false, tag_name: `v${version}` },
    repository: { full_name: 'zhuhanxin0308/vue-ex-ui' },
  },
  manifest: {
    name: 'vue-ex-ui',
    version,
    repository: { url: 'git+https://github.com/zhuhanxin0308/vue-ex-ui.git' },
  },
  lockfile: {
    name: 'vue-ex-ui',
    version,
    packages: { '': { name: 'vue-ex-ui', version } },
  },
});

test('正式版本仅发布到 latest，并允许带或不带 v 的同版本标签', () => {
  const context = createContext();
  assert.equal(validateReleaseContext(context), 'latest');
  context.event.release.tag_name = context.manifest.version;
  assert.equal(validateReleaseContext(context), 'latest');
});

test('预发布版本进入 next，不覆盖正式版本', () => {
  const context = createContext('3.1.0-rc.1');
  context.event.release.prerelease = true;
  assert.equal(validateReleaseContext(context), 'next');
});

test('构建元数据中的连字符不会被误认为预发布版本', () => {
  assert.equal(validateReleaseContext(createContext('3.0.0+build-20261111')), 'latest');
});

test('拒绝草稿、非发布事件以及缺失的 Release 信息', () => {
  for (const update of [
    context => {
      context.event.action = 'edited';
    },
    context => {
      context.event.release.draft = true;
    },
    context => {
      delete context.event.release;
    },
    context => {
      delete context.event.release.prerelease;
    },
  ]) {
    const context = createContext();
    update(context);
    assert.throws(() => validateReleaseContext(context), /已发布的 GitHub Release/);
  }
});

test('拒绝版本不一致和带命令字符的标签', () => {
  for (const tag of ['v2.0.0', 'latest', 'v3.0.0\nnext', 'v3.0.0; echo unsafe']) {
    const context = createContext();
    context.event.release.tag_name = tag;
    assert.throws(() => validateReleaseContext(context), /标签/);
  }
});

test('拒绝非法版本号', () => {
  for (const version of ['', '03.0.0', '3.0', '3.0.0-01', '3.0.0\n', null]) {
    assert.throws(() => validateReleaseContext(createContext(version)), /版本号/);
  }
});

test('拒绝 Release 类型与语义化版本不匹配', () => {
  const stable = createContext();
  stable.event.release.prerelease = true;
  assert.throws(() => validateReleaseContext(stable), /预发布标记/);
  assert.throws(() => validateReleaseContext(createContext('3.1.0-beta.1')), /预发布标记/);
});

test('拒绝锁文件根节点或包节点与待发布包不一致', () => {
  for (const update of [
    context => {
      context.lockfile.version = '2.0.0';
    },
    context => {
      context.lockfile.name = 'another-package';
    },
    context => {
      context.lockfile.packages[''].version = '2.0.0';
    },
    context => {
      context.lockfile.packages[''].name = 'another-package';
    },
    context => {
      delete context.lockfile.packages;
    },
  ]) {
    const context = createContext();
    update(context);
    assert.throws(() => validateReleaseContext(context), /锁文件/);
  }
});

test('拒绝 fork、仓库地址不匹配和缺失的仓库声明', () => {
  for (const update of [
    context => {
      context.event.repository.full_name = 'other/vue-ex-ui';
    },
    context => {
      delete context.manifest.repository;
    },
    context => {
      context.manifest.repository.url = 'https://example.com/vue-ex-ui';
    },
  ]) {
    const context = createContext();
    update(context);
    assert.throws(() => validateReleaseContext(context), /仓库/);
  }
});
