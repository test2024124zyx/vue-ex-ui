interface Decimal {
  coefficient: bigint;
  exponent: number;
}

// 保留 Number 的大数显示约定，避免把科学计数法展开成长整数。
const EXPONENTIAL_DISPLAY_THRESHOLD = 1e21;

/** 按 Number 的十进制表示拆分，兼容科学计数法。 */
function parseDecimal(value: number): Decimal {
  const [mantissa = '0', power = '0'] = value.toString().split('e');
  const [integer = '0', fraction = ''] = mantissa.split('.');
  return { coefficient: BigInt(integer + fraction), exponent: Number(power) - fraction.length };
}

function toInteger(decimal: Decimal, exponent: number): bigint {
  return decimal.coefficient * 10n ** BigInt(decimal.exponent - exponent);
}

function toNumber(coefficient: bigint, exponent: number): number {
  return Number(`${coefficient}e${exponent}`);
}

/** 对已舍入的十进制值补零，保留精度不足以容纳的精确边界值。 */
export function formatFixedDecimal(value: number, digits: number): string {
  if (!Number.isFinite(value) || Math.abs(value) >= EXPONENTIAL_DISPLAY_THRESHOLD) {
    return String(value);
  }
  const decimal = parseDecimal(value);
  if (decimal.exponent < -digits) return String(value);
  const scaled = toInteger(decimal, -digits);
  if (digits === 0) return String(scaled);
  const negative = scaled < 0n;
  const magnitude = String(negative ? -scaled : scaled).padStart(digits + 1, '0');
  return `${negative ? '-' : ''}${magnitude.slice(0, -digits)}.${magnitude.slice(-digits)}`;
}

/** 对齐十进制指数后加减，提交前只转换一次为 Number。 */
export function addDecimal(left: number, right: number): number {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return left + right;
  const first = parseDecimal(left);
  const second = parseDecimal(right);
  const exponent = Math.min(first.exponent, second.exponent);
  return toNumber(toInteger(first, exponent) + toInteger(second, exponent), exponent);
}

/** 对齐到最近刻度，中点向正方向舍入。 */
export function snapToDecimalStep(value: number, base: number, step: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(base) || !Number.isFinite(step) || step <= 0) {
    return value;
  }
  const current = parseDecimal(value);
  const origin = parseDecimal(base);
  const interval = parseDecimal(step);
  const exponent = Math.min(current.exponent, origin.exponent, interval.exponent);
  const start = toInteger(origin, exponent);
  const size = toInteger(interval, exponent);
  const offset = toInteger(current, exponent) - start;
  // BigInt 除法向零截断，负余数需要转成向下取整的刻度位置。
  const floor = offset / size - (offset % size < 0n ? 1n : 0n);
  const remainder = offset - floor * size;
  const index = 2n * remainder >= size ? floor + 1n : floor;
  return toNumber(start + index * size, exponent);
}
