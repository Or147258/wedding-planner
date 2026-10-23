// ארבעת הצדדים. המפתח (groom...) הוא מה שנשמר ב-Firestore, התווית היא מה שמוצג.
export const SIDES = {
  groom: {
    label: 'צד החתן (אור)',
    short: 'חתן',
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    barLight: 'bg-sky-200',
  },
  bride: {
    label: 'צד הכלה (עדן)',
    short: 'כלה',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
    barLight: 'bg-rose-200',
  },
  groomParents: {
    label: 'הוריי החתן',
    short: 'הורי החתן',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
    barLight: 'bg-violet-200',
  },
  brideParents: {
    label: 'הוריי הכלה',
    short: 'הורי הכלה',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    barLight: 'bg-amber-200',
  },
};

// סטטוסי אישור הגעה
export const RSVP = {
  pending: { label: 'טרם ענו', badge: 'bg-stone-100 text-stone-700 ring-stone-200' },
  confirmed: { label: 'אישרו הגעה', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  declined: { label: 'לא מגיעים', badge: 'bg-red-50 text-red-700 ring-red-200' },
  maybe: { label: 'מתלבטים', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

// מנות מיוחדות. מנה רגילה אינה נשמרת — היא מחושבת: כמות המוזמנים פחות המנות המיוחדות.
export const MEALS = {
  vegetarian: { label: 'צמחוני' },
  vegan: { label: 'טבעוני' },
  glutenFree: { label: 'ללא גלוטן' },
  kids: { label: 'מנת ילדים' },
};

export const DEFAULT_CATEGORIES = ['משפחה', 'חברים', 'עבודה'];

// הטקסט שנפתח בצ'אט וואטסאפ עם המוזמן
export const WHATSAPP_TEXT = 'היי, שומרים לכם מקום!';

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
