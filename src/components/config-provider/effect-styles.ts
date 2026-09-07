/**
 * 用实例边界排除嵌套 Provider，兼容库当前浏览器基线，不依赖较新的 CSS @scope。
 * 每层仅管理自身子树；嵌套层的有效配置由其自身规则负责。
 */
export function createProviderEffectStyles(id: string, animation: boolean, neon: boolean): string {
  const root = `[data-ex-provider="${id}"]`;
  const nested = `${root} [data-ex-provider]`;
  const local = (selector: string) => `${root} ${selector}:not(:is(${nested},${nested} *))`;
  const components = [local('[class^="ex-"]'), local('[class*=" ex-"]')].join(',');
  const rules: string[] = [];
  if (!neon) {
    rules.push(
      `${components}{box-shadow:none!important;text-shadow:none!important;filter:none!important}`
    );
    rules.push(`${local('.ex-avatar--clickable')}::before{display:none!important}`);
  }
  if (!animation) {
    rules.push(`${components}{transition:none!important;animation:none!important}`);
    rules.push(`${local('.ex-app')}::after{animation:none!important}`);
    rules.push(
      `${local('.ex-typography--glitch')}::before,${local('.ex-typography--glitch')}::after{animation:none!important}`
    );
    const transformTargets = [
      '.ex-avatar--clickable:hover',
      '.ex-avatar--clickable:active',
      '.ex-avatar--clickable > .ex-avatar__image:hover',
      '.ex-avatar-group__overflow:hover',
      '.ex-avatar-group__overflow:active',
    ];
    rules.push(`${transformTargets.map(local).join(',')}{transform:none!important}`);
  }
  return rules.join('\n');
}
