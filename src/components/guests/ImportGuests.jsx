import { useMemo, useRef, useState } from 'react';
import Modal from '../common/Modal';
import { DownloadIcon, UploadIcon } from '../common/Icons';
import { RSVP, SIDES } from '../../utils/constants';
import { exportSheets } from '../../utils/exportExcel';
import {
  IMPORT_FIELDS,
  TEMPLATE_HEADER,
  TEMPLATE_ROWS,
  buildImport,
  guessMapping,
  guessTableSide,
  readSpreadsheet,
} from '../../utils/importGuests';

const PREVIEW_ROWS = 6;

export default function ImportGuests({ open, onClose, existing, categories, onImport }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null); // { name, tables }
  const [configs, setConfigs] = useState([]); // לכל טבלה: { include, mapping, side }
  const [defaults, setDefaults] = useState({ category: categories[0] ?? '', rsvp: 'pending' });
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [missingQty, setMissingQty] = useState('skip');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setFile(null);
    setConfigs([]);
    setError('');
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = () => {
    reset();
    onClose();
  };

  const pickFile = async (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setError('');
    setBusy(true);
    try {
      const { tables } = await readSpreadsheet(picked);
      if (tables.length === 0 || tables.every((t) => t.rows.length === 0)) {
        setError('לא נמצאו מוזמנים בקובץ. צריכה להיות שורת כותרות (למשל "שם מוזמן") ומתחתיה המוזמנים.');
        setFile(null);
      } else {
        setFile({ name: picked.name, tables });
        setConfigs(
          tables.map((t) => ({
            include: t.rows.length > 0,
            mapping: guessMapping(t.headers),
            side: guessTableSide(t.title) ?? 'groom',
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError('לא הצלחנו לקרוא את הקובץ. ודאו שזה קובץ אקסל (xlsx / xls) או CSV.');
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  const updateConfig = (i, patch) => setConfigs((cs) => cs.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  const result = useMemo(() => {
    if (!file) return null;
    const chosen = file.tables
      .map((t, i) => ({ rows: t.rows, mapping: configs[i].mapping, defaultSide: configs[i].side, include: configs[i].include }))
      .filter((t) => t.include);
    return buildImport({ tables: chosen, defaults, existing, skipDuplicates, missingQty });
  }, [file, configs, defaults, existing, skipDuplicates, missingQty]);

  const newCategories = result
    ? [...new Set(result.items.map((g) => g.category))].filter(
        (c) => !categories.some((x) => x.toLowerCase() === c.toLowerCase())
      )
    : [];

  const confirm = () => {
    if (!result || result.items.length === 0) return;
    onImport(result.items, newCategories);
    close();
  };

  const downloadTemplate = () =>
    exportSheets('תבנית_מוזמנים.xlsx', [
      { name: 'מוזמנים', rows: TEMPLATE_ROWS, header: TEMPLATE_HEADER, widths: [26, 16, 14, 18, 14, 16] },
    ]);

  const totalPeople = result ? result.items.reduce((s, g) => s + g.count, 0) : 0;
  const includedIndexes = configs.map((c, i) => (c.include ? i : -1)).filter((i) => i >= 0);

  return (
    <Modal open={open} title="ייבוא מוזמנים מאקסל" onClose={close} wide>
      {!file ? (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            בחרו קובץ אקסל (xlsx / xls) או CSV. המערכת מחפשת בגיליון הראשון טבלאות מוזמנים לפי שורת הכותרות (למשל
            "שם מוזמן", "צד", "קטגוריה"), גם אם יש כמה טבלאות זו לצד זו או שורות סיכום מעליהן, ומזהה לבד איזו עמודה
            היא מה. לפני שמוסיפים משהו תראו תצוגה מקדימה ותוכלו לתקן.
          </p>

          <label
            htmlFor="import-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 px-6 py-10 text-center hover:border-rose-400 hover:bg-rose-50/40"
          >
            <UploadIcon width={28} className="text-stone-400" />
            <span className="text-sm font-medium">{busy ? 'קורא את הקובץ…' : 'לחצו לבחירת קובץ'}</span>
            <input
              id="import-file"
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={pickFile}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button type="button" className="btn-secondary" onClick={downloadTemplate}>
            <DownloadIcon width={16} />
            הורדת תבנית לדוגמה
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p>
              <span className="font-medium">{file.name}</span>{' '}
              <span className="text-stone-500">· נמצאו {file.tables.length} טבלאות</span>
            </p>
            <button type="button" className="text-rose-600 hover:underline" onClick={reset}>
              בחירת קובץ אחר
            </button>
          </div>

          <section aria-label="טבלאות בקובץ" className="space-y-3">
            {file.tables.map((t, i) => {
              const cfg = configs[i];
              const per = result && includedIndexes.includes(i) ? result.perTable[includedIndexes.indexOf(i)] : null;
              return (
                <div key={t.id} className="rounded-xl border border-stone-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={cfg.include}
                        onChange={(e) => updateConfig(i, { include: e.target.checked })}
                        className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-400"
                      />
                      {t.title || `טבלה ${i + 1}`}
                      <span className="font-normal text-stone-500">· {t.rows.length} שורות בקובץ</span>
                    </label>
                    {per && (
                      <span className="text-xs text-stone-500">
                        {per.invitations} הזמנות · {per.people} מוזמנים
                      </span>
                    )}
                  </div>

                  {cfg.include && (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <label htmlFor={`side-${i}`} className="text-stone-600">
                          צד לשורות שאין להן צד בקובץ:
                        </label>
                        <select
                          id={`side-${i}`}
                          className="input w-auto py-1.5"
                          value={cfg.side}
                          onChange={(e) => updateConfig(i, { side: e.target.value })}
                        >
                          {Object.entries(SIDES).map(([key, s]) => (
                            <option key={key} value={key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <details className="text-sm">
                        <summary className="cursor-pointer text-stone-600 hover:text-stone-900">
                          התאמת עמודות
                        </summary>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {IMPORT_FIELDS.map((f) => (
                            <div key={f.key}>
                              <label className="mb-1 block text-xs text-stone-600" htmlFor={`map-${i}-${f.key}`}>
                                {f.label}
                                {f.required && ' *'}
                              </label>
                              <select
                                id={`map-${i}-${f.key}`}
                                className="input py-1.5"
                                value={cfg.mapping[f.key]}
                                onChange={(e) =>
                                  updateConfig(i, { mapping: { ...cfg.mapping, [f.key]: Number(e.target.value) } })
                                }
                              >
                                <option value={-1}>— אין בקובץ —</option>
                                {t.headers.map((h, k) => (
                                  <option key={k} value={k}>
                                    {h}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold">הגדרות כלליות</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-stone-600" htmlFor="def-category">
                  קרבה לשורות בלי קרבה
                </label>
                <select
                  id="def-category"
                  className="input"
                  value={defaults.category}
                  onChange={(e) => setDefaults((d) => ({ ...d, category: e.target.value }))}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-600" htmlFor="def-rsvp">
                  סטטוס הגעה (כשאין בקובץ)
                </label>
                <select
                  id="def-rsvp"
                  className="input"
                  value={defaults.rsvp}
                  onChange={(e) => setDefaults((d) => ({ ...d, rsvp: e.target.value }))}
                >
                  {Object.entries(RSVP).map(([key, r]) => (
                    <option key={key} value={key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="mt-4">
              <legend className="mb-1 text-xs text-stone-600">שורה שיש בה שם אבל התא של הכמות ריק</legend>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="missing-qty"
                    checked={missingQty === 'skip'}
                    onChange={() => setMissingQty('skip')}
                    className="text-rose-600 focus:ring-rose-400"
                  />
                  לדלג עליה
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="missing-qty"
                    checked={missingQty === 'one'}
                    onChange={() => setMissingQty('one')}
                    className="text-rose-600 focus:ring-rose-400"
                  />
                  לייבא ככמות 1
                </label>
              </div>
            </fieldset>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-400"
              />
              לדלג על מוזמנים שכבר קיימים ברשימה (אותו שם, צד וטלפון), כך שאפשר לייבא את אותו קובץ שוב בלי כפילויות
            </label>
          </section>

          <section aria-label="תצוגה מקדימה">
            <h3 className="mb-2 text-sm font-semibold">תצוגה מקדימה</h3>
            {result.items.length === 0 ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                אין מה לייבא עם ההגדרות האלה. בדקו שנבחרה טבלה ושעמודת השם נבחרה נכון.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-stone-200">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="bg-stone-50 text-xs text-stone-500">
                    <tr>
                      <th className="px-3 py-2 text-start">שם</th>
                      <th className="px-3 py-2 text-start">פלאפון</th>
                      <th className="px-3 py-2 text-start">כמות</th>
                      <th className="px-3 py-2 text-start">צד</th>
                      <th className="px-3 py-2 text-start">קרבה</th>
                      <th className="px-3 py-2 text-start">ילדים</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {result.items.slice(0, PREVIEW_ROWS).map((g, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium">{g.name}</td>
                        <td className="whitespace-nowrap px-3 py-2 tabular-nums" dir="ltr">
                          {g.phone || '—'}
                        </td>
                        <td className="px-3 py-2 tabular-nums">{g.count}</td>
                        <td className="whitespace-nowrap px-3 py-2">{SIDES[g.side].label}</td>
                        <td className="px-3 py-2">{g.category}</td>
                        <td className="px-3 py-2 tabular-nums">{g.meals.kids || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <ul className="mt-3 space-y-1 text-sm text-stone-600">
              <li>
                יתווספו <strong className="text-stone-900">{result.items.length}</strong> הזמנות,{' '}
                <strong className="text-stone-900">{totalPeople}</strong> מוזמנים
                {result.items.length > PREVIEW_ROWS && ` (מוצגות ${PREVIEW_ROWS} ראשונות)`}.
              </li>
              {result.stats.noQty > 0 && (
                <li className="text-amber-700">
                  {result.stats.noQty} שורות בלי כמות ידולגו (אפשר לשנות בהגדרות למעלה).
                </li>
              )}
              {result.stats.duplicates > 0 && <li>{result.stats.duplicates} כפילויות ידולגו.</li>}
              {result.stats.unknownSide > 0 && (
                <li className="text-amber-700">
                  ב-{result.stats.unknownSide} שורות הצד לא זוהה והוגדר לפי ברירת המחדל של הטבלה.
                </li>
              )}
              {result.stats.unknownRsvp > 0 && (
                <li className="text-amber-700">
                  ב-{result.stats.unknownRsvp} שורות סטטוס ההגעה לא זוהה והוגדר לפי ברירת המחדל.
                </li>
              )}
              {result.repeatedNames.length > 0 && (
                <li>
                  {result.repeatedNames.length} שמות מופיעים יותר מפעם אחת בקובץ (לא דולגו, כי ייתכן שמדובר באנשים
                  שונים): {result.repeatedNames.slice(0, 6).join(', ')}
                  {result.repeatedNames.length > 6 && '…'}
                </li>
              )}
              {newCategories.length > 0 && <li>קטגוריות חדשות שיתווספו: {newCategories.join(', ')}.</li>}
            </ul>
          </section>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              className="btn-primary"
              onClick={confirm}
              disabled={result.items.length === 0}
            >
              ייבוא {result.items.length} הזמנות
            </button>
            <button type="button" className="btn-secondary" onClick={close}>
              ביטול
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
