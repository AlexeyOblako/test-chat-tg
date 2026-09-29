export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const phone = digits.length === 11 && digits.startsWith('8') ? `7${digits.slice(1)}` : digits;

  if (phone.length !== 11 && phone.length !== 12) {
    return null;
  }

  if (!phone.startsWith('7') && !phone.startsWith('375')) {
    return null;
  }

  return phone;
}

export function formatPhone(phone: string): string {
  if (!phone) {
    return '';
  }

  if (phone.length === 11) {
    return `+${phone[0]} ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
  }

  if (phone.length === 12) {
    return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10)}`;
  }

  return `+${phone}`;
}
