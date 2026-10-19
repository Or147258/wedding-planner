import { useState } from 'react';
import { SERVICE_SUGGESTIONS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';

export default function VendorForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name ?? '',
    type: initial?.type ?? '',
    total: initial?.total ?? '',
    paid: initial?.paid ?? '',
  }));
  const [error, setError] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const total = Number(form.total) || 0;
  const paid = Number(form.paid) || 0;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('נא להזין שם ספק או שירות');
    if (form.total === '' || total < 0) return setError('נא להזין עלות כוללת תקינה');
    if (paid < 0) return setError('המקדמה לא יכולה להיות שלילית');
    if (paid > total) return setError('המקדמה גבוהה מהעלות הכוללת');
    return onSubmit({ name: form.name.trim(), type: form.type.trim(), total, paid });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="vendor-name">
          שם הספק / השירות
        </label>
        <input
          id="vendor-name"
          autoFocus
          className="input"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="לדוגמה: אולמי אודאון / ווין"
        />
      </div>

      <div>
        <label className="label" htmlFor="vendor-type">
          סוג שירות <span className="font-normal text-stone-400">(לא חובה)</span>
        </label>
        <input
          id="vendor-type"
          list="service-suggestions"
          className="input"
          value={form.type}
          onChange={(e) => set('type', e.target.value)}
          placeholder="אולם, צלם, דיג'יי…"
        />
        <datalist id="service-suggestions">
          {SERVICE_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="vendor-total">
            עלות כוללת (₪)
          </label>
          <input
            id="vendor-total"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            className="input"
            value={form.total}
            onChange={(e) => set('total', e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="vendor-paid">
            מקדמה ששולמה (₪)
          </label>
          <input
            id="vendor-paid"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            className="input"
            value={form.paid}
            onChange={(e) => set('paid', e.target.value)}
          />
        </div>
      </div>

      <p className="rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
        יתרה לתשלום:{' '}
        <span className="font-semibold text-stone-800">{formatCurrency(Math.max(total - paid, 0))}</span>
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary">
          {initial ? 'שמירת שינויים' : 'הוספת ספק'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </form>
  );
}
