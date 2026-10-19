import { useState } from 'react';
import { PlusIcon } from '../common/Icons';

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd([{ title: title.trim(), dueDate }]);
    setTitle('');
    setDueDate('');
  };

  return (
    <form onSubmit={submit} className="card mb-6 flex flex-wrap items-end gap-3 p-4">
      <div className="min-w-[220px] flex-1">
        <label className="label" htmlFor="task-title">
          משימה חדשה
        </label>
        <input
          id="task-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="לדוגמה: לשלוח הזמנות"
        />
      </div>
      <div>
        <label className="label" htmlFor="task-due">
          תאריך יעד
        </label>
        <input
          id="task-due"
          type="date"
          className="input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <button type="submit" className="btn-primary" disabled={!title.trim()}>
        <PlusIcon />
        הוספה
      </button>
    </form>
  );
}
