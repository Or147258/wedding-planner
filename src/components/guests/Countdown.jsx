import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { PencilIcon } from '../common/Icons';
import { formatDate } from '../../utils/helpers';

const pad = (n) => String(n).padStart(2, '0');

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function Unit({ value, label }) {
  return (
    <div className="min-w-[72px] rounded-xl bg-white/15 px-3 py-3 text-center backdrop-blur-sm sm:min-w-[92px]">
      <p className="text-3xl font-semibold tabular-nums sm:text-4xl">{value}</p>
      <p className="mt-0.5 text-xs text-rose-100">{label}</p>
    </div>
  );
}

// טיימר ספירה לאחור לחתונה. date = YYYY-MM-DD (או null אם עוד לא הוגדר), time = HH:MM
export default function Countdown({ date, time, onSave }) {
  const now = useNow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ date: '', time: '19:00' });

  const openEditor = () => {
    setDraft({ date: date ?? '', time: time || '19:00' });
    setEditing(true);
  };

  const save = (e) => {
    e.preventDefault();
    if (!draft.date) return;
    onSave({ date: draft.date, time: draft.time || '19:00' });
    setEditing(false);
  };

  const target = date ? new Date(`${date}T${time || '19:00'}:00`).getTime() : null;
  const diff = target === null ? null : target - now;

  let body;
  if (diff === null) {
    body = (
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <p className="text-lg font-medium">מתי החתונה?</p>
        <p className="text-sm text-rose-100">הגדירו תאריך ונתחיל לספור לאחור.</p>
        <button
          type="button"
          onClick={openEditor}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
        >
          הגדרת תאריך החתונה
        </button>
      </div>
    );
  } else if (diff <= 0) {
    body = <p className="py-4 text-center text-2xl font-semibold">מזל טוב! החתונה כבר כאן 🎉</p>;
  } else {
    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    body = (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-rose-100">
          עד החתונה, ב-{formatDate(date)} בשעה {time || '19:00'}
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3" role="timer" aria-live="off">
          <Unit value={days} label="ימים" />
          <Unit value={pad(hours)} label="שעות" />
          <Unit value={pad(minutes)} label="דקות" />
          <Unit value={pad(seconds)} label="שניות" />
        </div>
      </div>
    );
  }

  return (
    <>
    <section
      className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-l from-rose-600 to-rose-500 p-6 text-white shadow-sm"
      aria-label="ספירה לאחור לחתונה"
    >
      {date && (
        <button
          type="button"
          onClick={openEditor}
          className="absolute end-3 top-3 rounded-lg p-2 text-rose-100 hover:bg-white/15 hover:text-white"
          aria-label="עריכת תאריך החתונה"
        >
          <PencilIcon />
        </button>
      )}
      {body}
    </section>

      <Modal open={editing} title="תאריך החתונה" onClose={() => setEditing(false)}>
        <form onSubmit={save} className="space-y-4 text-stone-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="wedding-date">
                תאריך
              </label>
              <input
                id="wedding-date"
                type="date"
                className="input"
                value={draft.date}
                onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="wedding-time">
                שעה
              </label>
              <input
                id="wedding-time"
                type="time"
                className="input"
                value={draft.time}
                onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary">
              שמירה
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              ביטול
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
