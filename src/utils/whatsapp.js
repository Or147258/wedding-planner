import { WHATSAPP_TEXT } from './constants';

// קישור לצ'אט וואטסאפ עם המוזמן. מספר ישראלי (050-…) הופך אוטומטית לפורמט בינלאומי (972…).
export function whatsappLink(phone, text = WHATSAPP_TEXT) {
  let digits = String(phone ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = `972${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
