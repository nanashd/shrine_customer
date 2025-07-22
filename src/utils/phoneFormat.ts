export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  } else if (digits.length === 10) {
    // 市外局番2桁 or 3桁
    if (/^0[789]0/.test(digits)) {
      return digits.replace(/(\d{3})(\d{4})(\d{3})/, "$1-$2-$3");
    } else {
      return digits.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
    }
  } else if (digits.length === 6) {
    return digits.replace(/(\d{2})(\d{4})/, "$1-$2");
  }
  return phone;
} 