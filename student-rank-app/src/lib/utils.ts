export const maskNumber = (num: number | string, visibleDigits: number = 3) => {
  const str = String(num);
  const visiblePart = str.slice(0, visibleDigits);
  const maskedPart = '*'.repeat(Math.max(0, str.length - visibleDigits));
  return visiblePart + maskedPart;
};