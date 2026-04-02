const phoneDigitsPattern = /\D/g;

export function normalizePhone(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getPhoneDigits(value: string | null | undefined): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(phoneDigitsPattern, "");
}

export function isValidPhone(value: string | null | undefined): boolean {
  const digits = getPhoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function getPhoneLast4(value: string | null | undefined): string | null {
  const digits = getPhoneDigits(value);
  return digits.length >= 4 ? digits.slice(-4) : null;
}
