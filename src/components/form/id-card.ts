const LEGACY_ID = /^\d{15}$/;
const ID_WITH_CHECK_DIGIT = /^\d{6}(\d{4})(\d{2})(\d{2})\d{3}([\dXx])$/;
// GB 11643—1999 表 1 和表 2，按号码从左到右应用 MOD 11-2。
const DIGIT_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2] as const;
const CHECK_DIGITS = '10X98765432';

export function isIdCard(value: string): boolean {
  if (typeof value !== 'string') return false;
  if (LEGACY_ID.test(value)) return true;
  const match = ID_WITH_CHECK_DIGIT.exec(value);
  if (!match) return false;

  const [, birthYear, birthMonth, birthDay, checkDigit] = match;
  const date = `${birthYear}-${birthMonth}-${birthDay}`;
  // 出生日期是日历日期，按 UTC 比较可避免本地时区跳过历史日期时误判。
  const birth = new Date(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== date) return false;

  const sum = DIGIT_WEIGHTS.reduce(
    (total, weight, index) => total + Number(value[index]) * weight,
    0
  );
  return CHECK_DIGITS[sum % CHECK_DIGITS.length] === checkDigit?.toUpperCase();
}
