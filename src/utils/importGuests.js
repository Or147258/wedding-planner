import * as XLSX from 'xlsx';
import { RSVP, SIDES } from './constants';

/*
 * ייבוא מוזמנים מקובץ אקסל / CSV.
 * 1. readSpreadsheet  – מאתר בגיליון הראשון טבלאות מוזמנים (יכולות להיות כמה, זו לצד זו או זו מתחת לזו,
 *                       עם שורות סיכום מעליהן), ומחזיר לכל טבלה: כותרת, כותרות עמודות ושורות.
 * 2. guessMapping     – מנחש איזו עמודה היא איזה שדה (לפי שם הכותרת).
 * 3. buildImport      – ממיר שורות למוזמנים תקינים, מדלג על שורות ריקות/בלי כמות/כפילויות.
 */

export const IMPORT_FIELDS = [
  { key: 'name', label: 'שם', required: true },
  { key: 'phone', label: 'מספר פלאפון' },
  { key: 'count', label: 'כמות מוזמנים' },
  { key: 'kids', label: 'ילדים (מנות ילדים)' },
  { key: 'side', label: 'צד' },
  { key: 'category', label: 'קרבה' },
  { key: 'rsvp', label: 'סטטוס הגעה' },
];

// סדר החיפוש חשוב: שדות ספציפיים קודם, ו"שם" אחרון כי הוא הכי כללי.
// בתוך כל שדה — ההתאמה הראשונה ברשימה גוברת (למשל "כמות מוזמנים" לפני "כמות" סתם).
const HINTS = [
  ['phone', ['פלאפון', 'טלפון', 'נייד', 'סלולר', 'phone', 'mobile', 'cell']],
  ['kids', ['ילדים', 'ילד', 'kids', 'children']],
  ['count', ['כמות מוזמנים', 'מס אורחים מוזמנים', 'מספר מוזמנים', 'מס מוזמנים', 'אורחים', 'כמות', 'כמה', 'נפשות', 'count', 'qty']],
  ['side', ['צד', 'side']],
  ['category', ['קרבה', 'קטגוריה', 'קבוצה', 'category', 'group']],
  ['rsvp', ['אישור', 'סטטוס', 'הגעה', 'rsvp', 'status']],
  ['name', ['שם מוזמן', 'שם', 'משפחה', 'מוזמן', 'name', 'guest']],
];

// עמודות "צפי הגעה" / אחוזים אינן שדה של האפליקציה, ואסור שיתפסו את "כמות" או "הגעה"
const IGNORE = ['שצופים', 'צפי', 'שתגיע', 'שיגיעו', 'אחוז'];

const clean = (v) =>
  String(v ?? '')
    .replace(/["'׳״.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const tidyName = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();

const isTotalRow = (name) => /^סה ?כ/.test(clean(name));

const isNameHeader = (text) => {
  const s = clean(text);
  return s === 'name' || s === 'שם' || s.startsWith('שם ');
};

function fieldOfHeader(text) {
  const h = clean(text);
  if (!h || IGNORE.some((w) => h.includes(w))) return null;
  const hit = HINTS.find(([, hints]) => hints.some((hint) => h.includes(hint)));
  return hit ? hit[0] : null;
}

/* ---------- קריאת הקובץ ---------- */

export async function readSpreadsheet(file) {
  const isCsv = /\.csv$/i.test(file.name);
  const wb = isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });

  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return { tables: [] };

  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: true, raw: false });
  const text = (r, c) => String(grid[r]?.[c] ?? '').trim();

  const tables = [];

  // טבלה מתחילה בתא כותרת "שם…" שמימינו (באותה שורה) לפחות עוד כותרת מוכרת אחת
  grid.forEach((row, r) => {
    for (let c = 0; c < row.length; c += 1) {
      if (!isNameHeader(text(r, c))) continue;

      let end = c;
      while (end < row.length && text(r, end)) end += 1;
      const headers = Array.from({ length: end - c }, (_, i) => text(r, c + i));
      const recognized = headers.filter((h, i) => i > 0 && fieldOfHeader(h)).length;
      if (headers.length < 2 || recognized < 1) continue;

      // כותרת הטבלה: הטקסט הקרוב מעל הכותרות, באותה עמודה (עד 3 שורות למעלה)
      let title = '';
      for (let up = 1; up <= 3 && !title && r - up >= 0; up += 1) {
        const t = text(r - up, c);
        if (t && !/^[\d.,%\s]+$/.test(t)) title = t;
      }

      // השורות: עד שורת "סה״כ" (שורות ריקות באמצע מדלגים), או עד סוף הגיליון
      const rows = [];
      for (let rr = r + 1; rr < grid.length; rr += 1) {
        const name = text(rr, c);
        if (isTotalRow(name) || clean(name) === clean(headers[0])) break;
        if (!name) continue;
        rows.push(headers.map((_, i) => String(grid[rr][c + i] ?? '').trim()));
      }

      tables.push({ id: `${r}:${c}`, title, headers, rows });
      c = end; // ממשיכים לחפש טבלה נוספת מימין
    }
  });

  if (tables.length > 0) return { tables };

  // לא נמצאה כותרת "שם…": מתייחסים לשורה הראשונה כאל כותרות (קובץ פשוט)
  const filled = grid.filter((row) => row.some((cell) => String(cell).trim() !== ''));
  if (filled.length < 2) return { tables: [] };
  const width = Math.max(...filled.map((r) => r.length));
  const headers = Array.from({ length: width }, (_, i) => String(filled[0][i] ?? '').trim() || `עמודה ${i + 1}`);
  const rows = filled
    .slice(1)
    .map((r) => Array.from({ length: width }, (_, i) => String(r[i] ?? '').trim()));
  return { tables: [{ id: '0:0', title: '', headers, rows }] };
}

/* ---------- זיהוי עמודות וצד ---------- */

// מחזיר { name: אינדקס עמודה או -1, phone: ..., ... }
export function guessMapping(headers) {
  const normalized = headers.map(clean);
  const used = new Set();
  const mapping = Object.fromEntries(IMPORT_FIELDS.map((f) => [f.key, -1]));

  HINTS.forEach(([key, hints]) => {
    for (const hint of hints) {
      const idx = normalized.findIndex(
        (h, i) => !used.has(i) && h && !IGNORE.some((w) => h.includes(w)) && h.includes(hint)
      );
      if (idx >= 0) {
        mapping[key] = idx;
        used.add(idx);
        return;
      }
    }
  });

  // לא מצאנו עמודת שם לפי כותרת: העמודה הראשונה שלא נתפסה
  if (mapping.name < 0) {
    const first = headers.findIndex((_, i) => !used.has(i));
    if (first >= 0) mapping.name = first;
  }
  return mapping;
}

// כותרת טבלה כמו "הורים אור" / "הורים עדן" קובעת את הצד של כל השורות. מחזיר null אם אי אפשר לדעת.
export function guessTableSide(title) {
  const s = clean(title);
  const parents = s.includes('הורי');
  const groom = s.includes('חתן') || s.includes('אור');
  const bride = s.includes('כלה') || s.includes('עדן');
  if (parents && groom && !bride) return 'groomParents';
  if (parents && bride && !groom) return 'brideParents';
  if (!parents && groom && !bride) return 'groom';
  if (!parents && bride && !groom) return 'bride';
  return null;
}

/* ---------- המרת ערכים ---------- */

const formatIsraeli = (d) => `${d.slice(0, 3)}-${d.slice(3)}`;

// אקסל "אוכל" אפס מוביל (0501234567 הופך ל-501234567), אז מחזירים אותו
export function normalizePhone(value) {
  const raw = String(value ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 9 && digits[0] === '5') return formatIsraeli(`0${digits}`);
  if (digits.length === 10 && digits.startsWith('05')) return formatIsraeli(digits);
  return raw;
}

// מספר שלם ≥ 1, או null אם התא ריק / לא מספר
export function parseCount(value) {
  const n = parseInt(String(value ?? '').replace(/\D/g, ''), 10);
  return n >= 1 ? n : null;
}

// מחזיר מפתח צד, או null אם הערך לא מזוהה
export function normalizeSide(value) {
  const s = clean(value);
  if (!s) return null;
  const parents = s.includes('הורי') || s.includes('הוריי');
  const groom = s.includes('חתן') || s.includes('אור') || s === 'groom';
  const bride = s.includes('כלה') || s.includes('עדן') || s === 'bride';
  if (parents && groom && !bride) return 'groomParents';
  if (parents && bride && !groom) return 'brideParents';
  if (groom && !bride) return 'groom';
  if (bride && !groom) return 'bride';
  return null;
}

// מחזיר מפתח סטטוס, או null אם הערך לא מזוהה.
// הסדר חשוב: "עוד לא ענו" מכיל "לא" אבל הוא לא "לא מגיעים".
export function normalizeRsvp(value) {
  const s = clean(value);
  if (!s) return null;
  if (s.includes('טרם') || s.includes('ממתין') || s.includes('לא ענ') || s.includes('לא אישר')) return 'pending';
  if (s.includes('מתלבט') || s.includes('אולי') || s.includes('לא החליט') || s === 'maybe') return 'maybe';
  if (
    s.includes('לא מגיע') ||
    s.includes('לא יגיע') ||
    s.includes('לא אגיע') ||
    s.includes('מסרב') ||
    s === 'לא' ||
    s === 'no'
  ) {
    return 'declined';
  }
  if (s.includes('אישר') || s.includes('מגיע') || s === 'כן' || s === 'yes') return 'confirmed';
  return null;
}

const digitsOf = (v) => String(v ?? '').replace(/\D/g, '');
const guestKey = (name, phone, side) => `${clean(name)}|${digitsOf(phone)}|${side}`;

/**
 * tables:  [{ rows, mapping, defaultSide }]  – רק הטבלאות שנבחרו לייבוא
 * defaults: { category, rsvp }               – לשדות חסרים / לא מזוהים
 * existing: המוזמנים שכבר באפליקציה (למניעת כפילות בייבוא חוזר)
 * missingQty: 'skip' | 'one'                 – מה לעשות עם שורה שיש בה שם אבל אין כמות
 */
export function buildImport({ tables, defaults, existing, skipDuplicates, missingQty }) {
  const existingKeys = new Set(existing.map((g) => guestKey(g.name, g.phone, g.side)));
  const seenWithPhone = new Set();
  const items = [];
  const perTable = [];
  const stats = { noQty: 0, duplicates: 0, unknownSide: 0, unknownRsvp: 0 };

  tables.forEach(({ rows, mapping, defaultSide }) => {
    const cell = (row, key) => (mapping[key] >= 0 ? row[mapping[key]] : '');
    const before = items.length;

    rows.forEach((row) => {
      const name = tidyName(cell(row, 'name'));
      if (!name) return;

      let count = 1;
      if (mapping.count >= 0) {
        count = parseCount(cell(row, 'count'));
        if (count === null) {
          if (missingQty === 'skip') {
            stats.noQty += 1;
            return;
          }
          count = 1;
        }
      }

      const phone = normalizePhone(cell(row, 'phone'));

      const rawSide = cell(row, 'side');
      let side = normalizeSide(rawSide);
      if (!side) {
        if (String(rawSide).trim()) stats.unknownSide += 1;
        side = defaultSide;
      }

      if (skipDuplicates) {
        const key = guestKey(name, phone, side);
        // מול הרשימה הקיימת: שם+צד+טלפון. בתוך הקובץ: רק כשיש טלפון (שני אנשים בשם "יוסי" הם לא בהכרח אותו אדם)
        if (existingKeys.has(key) || (phone && seenWithPhone.has(key))) {
          stats.duplicates += 1;
          return;
        }
        if (phone) seenWithPhone.add(key);
      }

      const rawRsvp = cell(row, 'rsvp');
      let rsvp = normalizeRsvp(rawRsvp);
      if (!rsvp) {
        if (String(rawRsvp).trim()) stats.unknownRsvp += 1;
        rsvp = defaults.rsvp;
      }

      const kids = Math.min(parseCount(cell(row, 'kids')) ?? 0, count);

      items.push({
        name,
        phone,
        count,
        side,
        category: tidyName(cell(row, 'category')) || defaults.category,
        rsvp,
        meals: kids > 0 ? { kids } : {},
      });
    });

    const added = items.slice(before);
    perTable.push({ invitations: added.length, people: added.reduce((s, g) => s + g.count, 0) });
  });

  // שמות שמופיעים יותר מפעם אחת (לא מדולגים — רק מדווחים, כדי שתוכלו לבדוק)
  const nameCounts = {};
  items.forEach((g) => {
    const k = clean(g.name);
    nameCounts[k] = (nameCounts[k] ?? 0) + 1;
  });
  const repeatedNames = [...new Set(items.filter((g) => nameCounts[clean(g.name)] > 1).map((g) => g.name))];

  return { items, stats, perTable, repeatedNames };
}

/* ---------- תבנית להורדה ---------- */

export const TEMPLATE_HEADER = ['שם', 'מספר פלאפון', 'כמות מוזמנים', 'צד', 'קרבה', 'סטטוס הגעה'];

export const TEMPLATE_ROWS = [
  {
    שם: 'משפחת כהן',
    'מספר פלאפון': '050-1234567',
    'כמות מוזמנים': 4,
    צד: SIDES.groom.label,
    קרבה: 'משפחה',
    'סטטוס הגעה': RSVP.pending.label,
  },
];
