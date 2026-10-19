import { useState } from 'react';
import { CheckIcon, TrashIcon } from '../common/Icons';
import { daysUntil } from '../../utils/helpers';

function DueBadge({ dueDate }) {
  const d = daysUntil(dueDate);
  let text;
  let cls;
  if (d < 0) {
    text = d === -1 ? 'באיחור של יום' : `באיחור של ${-d} ימים`;
    cls = 'bg-red-50 text-red-700';
  } else if (d === 0) {
    text = 'היום';
    cls = 'bg-amber-50 text-amber-700';
  } else if (d === 1) {
    text = 'מחר';
    cls = 'bg-amber-50 text-amber-700';
  } else if (d <= 7) {
    text = `בעוד ${d} ימים`;
    cls = 'bg-sky-50 text-sky-700';
  } else {
    return null;
  }
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{text}</span>
  );
}

function EditableTitle({ value, done, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== value) onSave(next);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        className="input py-1"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        aria-label="עריכת משימה"
      />
    );
  }

  return (
    <button
      type="button"
      title="לחיצה לעריכה"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={`block w-full text-start text-sm ${done ? 'text-stone-400 line-through' : 'font-medium'}`}
    >
      {value}
    </button>
  );
}

export default function TaskItem({ task, onUpdate, onDelete }) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
      <button
        type="button"
        role="checkbox"
        aria-checked={task.done}
        aria-label={task.done ? 'סימון כלא הושלמה' : 'סימון כהושלמה'}
        onClick={() => onUpdate(task.id, { done: !task.done })}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.done
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-stone-300 text-transparent hover:border-emerald-400'
        }`}
      >
        <CheckIcon width={14} height={14} strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1 basis-40">
        <EditableTitle
          value={task.title}
          done={task.done}
          onSave={(title) => onUpdate(task.id, { title })}
        />
      </div>

      {!task.done && task.dueDate && <DueBadge dueDate={task.dueDate} />}

      <input
        type="date"
        className="input w-auto py-1.5"
        value={task.dueDate}
        onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
        aria-label="תאריך יעד"
      />

      <button
        type="button"
        className="btn-icon-danger"
        onClick={() => onDelete(task.id)}
        aria-label={`מחיקת ${task.title}`}
      >
        <TrashIcon />
      </button>
    </li>
  );
}
