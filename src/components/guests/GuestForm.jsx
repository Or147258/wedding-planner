import { useState } from 'react';
import { PlusIcon } from '../common/Icons';
import { RSVP, SIDES } from '../../utils/constants';

export default function GuestForm({ initial, categories, onAddCategory, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    count: initial?.count ?? 1,
    side: initial?.side ?? 'groom',
    category: initial?.category ?? categories[0] ?? '',
    rsvp: initial?.rsvp ?? 'pending',
  }));
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const commitCategory = () => {
    const name = newCategory.trim();
    if (!name) return;
    set('category', onAddCategory(name));
    setNewCategory('');
    setAddingCategory(false);
  };

  const submit = (e) => {
    e.preventDefault();
    const count = parseInt(form.count, 10);
    if (!form.name.trim()) return setError('נא להזין שם מוזמן או משפחה');
    if (!count || count < 1) return setError('כמות המוזמנים חייבת להיות לפחות 1');
    if (!form.category) return setError('נא לבחור קרבה');
    const phone = form.phone.trim();
    const digits = phone.replace(/\D/g, '');
    if (phone && (digits.length < 9 || digits.length > 13)) {
      return setError('מספר הפלאפון אינו תקין (לדוגמה 050-1234567)');
    }
    return onSubmit({ ...form, name: form.name.trim(), phone, count });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
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
          מספר פלאפון
        </label>
        <input
          id="guest-phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="off"
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
        <span className="label">צד</span>
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
      </div>

      <div>
        <label className="label" htmlFor="guest-category">
          קרבה
        </label>
        {addingCategory ? (
          <div className="flex gap-2">
            <input
              autoFocus
              className="input"
              placeholder="שם הקטגוריה החדשה"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitCategory();
                }
              }}
            />
            <button type="button" className="btn-primary" onClick={commitCategory}>
              הוספה
            </button>
            <button type="button" className="btn-secondary" onClick={() => setAddingCategory(false)}>
              ביטול
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              id="guest-category"
              className="input"
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-secondary whitespace-nowrap"
              onClick={() => setAddingCategory(true)}
            >
              <PlusIcon width={16} height={16} />
              קטגוריה חדשה
            </button>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary">
          {initial ? 'שמירת שינויים' : 'הוספת מוזמן'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </form>
  );
}
