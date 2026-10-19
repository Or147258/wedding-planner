import { useState } from 'react';

export default function TableForm({ table, defaults, existingNumbers, onSubmit, onCancel }) {
  const editing = Boolean(table);
  const [number, setNumber] = useState(String(table?.number ?? defaults.number));
  const [capacity, setCapacity] = useState(String(table?.capacity ?? defaults.capacity));
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const start = parseInt(number, 10);
    const cap = parseInt(capacity, 10);
    const qty = editing ? 1 : parseInt(quantity, 10);

    if (!start || start < 1) return setError('מספר שולחן חייב להיות 1 ומעלה');
    if (!cap || cap < 1) return setError('כמות המקומות חייבת להיות לפחות 1');
    if (!qty || qty < 1 || qty > 100) return setError('אפשר להוסיף בין 1 ל-100 שולחנות בבת אחת');

    const numbers = Array.from({ length: qty }, (_, i) => start + i);
    const clash = numbers.find((n) => existingNumbers.includes(n));
    if (clash) return setError(`שולחן ${clash} כבר קיים`);

    return onSubmit(numbers.map((n) => ({ number: n, capacity: cap })));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="table-number">
            {editing ? 'מספר שולחן' : 'מספר שולחן ראשון'}
          </label>
          <input
            id="table-number"
            type="number"
            min="1"
            autoFocus
            className="input"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="table-capacity">
            מקומות ישיבה מקסימליים
          </label>
          <input
            id="table-capacity"
            type="number"
            min="1"
            className="input"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
      </div>

      {!editing && (
        <div>
          <label className="label" htmlFor="table-quantity">
            כמה שולחנות להוסיף
          </label>
          <input
            id="table-quantity"
            type="number"
            min="1"
            max="100"
            className="input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <p className="mt-1 text-xs text-stone-500">
            השולחנות ימוספרו ברצף, כולם עם אותה כמות מקומות. אפשר לשנות כל שולחן בנפרד אחר כך.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary">
          {editing ? 'שמירת שינויים' : 'הוספה'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </form>
  );
}
