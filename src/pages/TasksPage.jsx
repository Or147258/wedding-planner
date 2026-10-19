import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import ProgressBar from '../components/common/ProgressBar';
import TaskForm from '../components/tasks/TaskForm';
import TaskItem from '../components/tasks/TaskItem';
import { STARTER_TASKS } from '../utils/constants';
import { percent } from '../utils/helpers';

const FILTERS = [
  { id: 'all', label: 'הכול' },
  { id: 'open', label: 'פתוחות' },
  { id: 'done', label: 'הושלמו' },
];

const NO_DATE = '9999-99-99';

export default function TasksPage({ tasks, onAdd, onUpdate, onDelete }) {
  const [filter, setFilter] = useState('all');

  const doneCount = tasks.filter((t) => t.done).length;

  // משימות פתוחות לפי תאריך יעד (בלי תאריך — בסוף), משימות שהושלמו בתחתית
  const sorted = [...tasks].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.dueDate || NO_DATE).localeCompare(b.dueDate || NO_DATE) ||
      a.createdAt - b.createdAt
  );

  const visible = sorted.filter(
    (t) => filter === 'all' || (filter === 'done' ? t.done : !t.done)
  );

  return (
    <>
      <PageHeader title="צ'קליסט ומשימות" subtitle="כל מה שצריך לסגור לפני החתונה, עם תאריכי יעד" />

      <TaskForm onAdd={onAdd} />

      {tasks.length === 0 ? (
        <EmptyState
          title="הרשימה ריקה"
          text="הוסיפו משימה למעלה, או התחילו מרשימה מוכנה של משימות נפוצות לחתונה."
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onAdd(STARTER_TASKS.map((title) => ({ title, dueDate: '' })))}
          >
            הוספת משימות מוצעות
          </button>
        </EmptyState>
      ) : (
        <>
          <div className="card mb-4 p-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">
                {doneCount} מתוך {tasks.length} משימות הושלמו
              </span>
              <span className="tabular-nums text-stone-500">{percent(doneCount, tasks.length)}%</span>
            </div>
            <ProgressBar value={percent(doneCount, tasks.length)} color="bg-emerald-500" label="התקדמות משימות" />
          </div>

          <div className="mb-3 flex gap-2" role="tablist" aria-label="סינון משימות">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filter === f.id
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:bg-stone-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState title="אין משימות להצגה" text="שנו את הסינון כדי לראות משימות אחרות." />
          ) : (
            <ul className="card divide-y divide-stone-100">
              {visible.map((t) => (
                <TaskItem key={t.id} task={t} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
