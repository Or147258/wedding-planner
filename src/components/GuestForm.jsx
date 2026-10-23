import { useEffect, useState } from 'react';
import { CATEGORIES, RSVP, SIDES } from '../constants';

// חלון הוספה / עריכה של מוזמן. initial = המוזמן לעריכה, או null להוספה.
export default function GuestForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    count: initial?.count ?? 1,
    rsvp: initial?.rsvp ?? 'pending',
    category: initial?.category ?? CATEGORIES[0],
    side: initial?.side ?? 'groom',
  });
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    const count = parseInt(form.count, 10);
    const phone = form.phone.trim();
    const digits = phone.replace(/\D/g, '');

    if (!form.name.trim()) return setError('נא להזין שם');
    if (phone && (digits.length < 9 || digits.length > 13)) {
      return setError('מספר הטלפון אינו תקין (לדוגמה 050-1234567)');
    }
    if (!count || count < 1) return setError('כמות המוזמנים חייבת להיות לפחות 1');

    return onSubmit({
      name: form.name.trim(),
      phone,
      count,
      rsvp: form.rsvp,
      category: form.category,
      side: form.side,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'עריכת מוזמן' : 'הוספת מוזמן'}
        onMouseDown={(e) => e.stopPropagation()}
        className="card max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-b-none p-6 shadow-xl sm:rounded-b-2xl"
      >
        <h2 className="text-lg font-semibold">{initial ? 'עריכת מוזמן' : 'הוספת מוזמן'}</h2>

        <div>
          <label className="label" htmlFor="guest-name">
            שם המוזמן או המשפחה
          </label>
          <input
            id="guest-name"
            autoFocus
            className="input"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="לדוגמה: משפחת כהן"
          />
        </div>

        <div>
          <label className="label" htmlFor="guest-phone">
            מספר טלפון
          </label>
          <input
            id="guest-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            className="input text-end"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="050-1234567"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="guest-count">
              כמות מוזמנים
            </label>
            <input
              id="guest-count"
              type="number"
              min="1"
              className="input"
              value={form.count}
              onChange={(e) => set('count', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="guest-rsvp">
              סטטוס הגעה
            </label>
            <select
              id="guest-rsvp"
              className="input"
              value={form.rsvp}
              onChange={(e) => set('rsvp', e.target.value)}
            >
              {Object.entries(RSVP).map(([key, r]) => (
                <option key={key} value={key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="guest-category">
            קטגוריה
          </label>
          <select
            id="guest-category"
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="label">צד</legend>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SIDES).map(([key, s]) => (
              <button
                key={key}
                type="button"
                aria-pressed={form.side === key}
                onClick={() => set('side', key)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  form.side === key
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </fieldset>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary">
            {initial ? 'שמירת שינויים' : 'הוספת מוזמן'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
}
