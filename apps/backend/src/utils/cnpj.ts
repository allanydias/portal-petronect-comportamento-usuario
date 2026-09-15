export function normalizeCnpj(value: string): string {
  return value.replace(/\D/g, "");
}

export function maskCnpj(cnpj: string): string {
  const value = normalizeCnpj(cnpj);
  if (value.length !== 14) return "**.***.***/****-**";
  return `${value.slice(0, 2)}.***.***/${value.slice(8, 12)}-**`;
}

export function isValidCnpj(cnpj: string): boolean {
  const value = normalizeCnpj(cnpj);
  if (value.length !== 14 || /^(\d)\1{13}$/.test(value)) return false;

  const digits = value.split("").map(Number);

  const calculateDigit = (length: number): number => {
    const numbers = digits.slice(0, length);
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = numbers.reduce((acc, digit, index) => acc + digit * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calculateDigit(12) === digits[12] && calculateDigit(13) === digits[13];
}
