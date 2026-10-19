// צדדים: חתן (אור) / כלה (עדן)
export const SIDES = {
  groom: {
    label: 'חתן (אור)',
    short: 'חתן',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    barLight: 'bg-sky-200',
  },
  bride: {
    label: 'כלה (עדן)',
    short: 'כלה',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    barLight: 'bg-rose-200',
  },
};

// סטטוסי אישור הגעה
export const RSVP = {
  pending: { label: 'טרם ענו', badge: 'bg-stone-100 text-stone-700 ring-stone-200' },
  confirmed: { label: 'אישרו הגעה', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  declined: { label: 'לא מגיעים', badge: 'bg-red-50 text-red-700 ring-red-200' },
  maybe: { label: 'מתלבטים', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

export const DEFAULT_CATEGORIES = ['משפחה', 'חברים', 'עבודה'];

// הצעות לסוג שירות בדף התקציב
export const SERVICE_SUGGESTIONS = [
  'אולם',
  'צלם',
  "דיג'יי",
  'איפור ושיער',
  'רב',
  'קייטרינג',
  'הזמנות',
  'פרחים ועיצוב',
  'שמלה',
  'חליפה',
  'תאורה והגברה',
  'להקה',
  'הסעות',
];

// משימות מוצעות לצ'קליסט
export const STARTER_TASKS = [
  'לקבוע תאריך ולשריין אולם',
  'לבחור רב / עורך טקס',
  'לסגור צלם סטילס ווידאו',
  "לסגור דיג'יי / להקה",
  'לבחור שמלה וחליפה',
  'לסגור איפור ושיער',
  'לעצב ולשלוח הזמנות',
  'לעקוב אחרי אישורי הגעה',
  'לסגור תפריט וטעימות באולם',
  'לתכנן סידורי הושבה',
  'לתאם הסעות לאורחים',
  'לסגור טבעות',
];
