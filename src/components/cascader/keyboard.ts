/** 在循环选项列表中按方向查找下一个未禁用项。 */
export function findNextEnabledIndex(
  options: ReadonlyArray<{ disabled?: boolean }>,
  from: number,
  step: 1 | -1
): number {
  if (options.length === 0) return -1;

  const start = from < 0 ? (step === 1 ? -1 : options.length) : from;
  for (let offset = 1; offset <= options.length; offset += 1) {
    const rawIndex = start + step * offset;
    const index = ((rawIndex % options.length) + options.length) % options.length;
    if (!options[index]?.disabled) return index;
  }

  return -1;
}
