export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const currencyFmt = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 2,
});

export const formatCurrency = (n) => currencyFmt.format(Number(n) || 0);

export const sumBy = (arr, fn) => arr.reduce((s, x) => s + (Number(fn(x)) || 0), 0);

export const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// תאריך מקומי בפורמט YYYY-MM-DD (בלי המרה ל-UTC)
export const todayISO = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// כמה ימים עד התאריך (שלילי = עבר)
export const daysUntil = (iso) =>
  Math.round(
    (new Date(`${iso}T00:00:00`) - new Date(`${todayISO()}T00:00:00`)) / 86400000
  );

export const byHebrewName = (a, b) => a.name.localeCompare(b.name, 'he');
