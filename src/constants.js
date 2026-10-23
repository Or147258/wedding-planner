// ארבעת הצדדים. המפתח (groom...) הוא מה שנשמר ב-Firestore, התווית היא מה שמוצג.
export const SIDES = {
  groom: { label: 'צד החתן (אור)', badge: 'bg-sky-50 text-sky-700 ring-sky-200' },
  bride: { label: 'צד הכלה (עדן)', badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
  groomParents: { label: 'הוריי החתן', badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  brideParents: { label: 'הוריי הכלה', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

export const RSVP = {
  pending: { label: 'טרם ענו', badge: 'bg-stone-100 text-stone-700 ring-stone-200' },
  confirmed: { label: 'אישרו הגעה', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  declined: { label: 'לא מגיעים', badge: 'bg-red-50 text-red-700 ring-red-200' },
  maybe: { label: 'מתלבטים', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
};

export const CATEGORIES = ['משפחה', 'חברים', 'עבודה', 'אחר'];
