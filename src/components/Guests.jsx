import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useGuests from '../hooks/useGuests';
import GuestForm from './GuestForm';
import GuestList from './GuestList';

const describeError = (err) => {
  if (err?.code === 'permission-denied') {
    return 'אין הרשאה לגשת לנתונים. בדקו שפרסמתם את חוקי האבטחה (firestore.rules) עם כתובת המייל שלכם.';
  }
  return `שגיאה בתקשורת עם Firebase (${err?.code ?? 'לא ידועה'}).`;
};

export default function Guests() {
  const { guests, loading, error } = useGuests();
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState({ open: false, guest: null });
  const [actionError, setActionError] = useState('');

  // כל כתיבה ל-Firestore עוברת כאן: שגיאה מוצגת למשתמש במקום להיבלע
  const run = (promise) => promise.catch((err) => {
    console.error(err);
    setActionError(describeError(err));
  });

  const closeModal = () => setModal({ open: false, guest: null });

  const save = (values) => {
    if (modal.guest) run(updateDoc(doc(db, 'guests', modal.guest.id), values));
    else run(addDoc(collection(db, 'guests'), { ...values, createdAt: Date.now() }));
    closeModal();
  };

  const remove = (guest) => {
    if (window.confirm(`למחוק את "${guest.name}"?`)) run(deleteDoc(doc(db, 'guests', guest.id)));
  };

  const changeRsvp = (id, rsvp) => run(updateDoc(doc(db, 'guests', id), { rsvp }));

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">רשימת מוזמנים</h1>
          <p className="mt-1 text-sm text-stone-500">מסתנכרנת בזמן אמת בין כל המכשירים</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setModal({ open: true, guest: null })}>
          + הוספת מוזמן
        </button>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="flex-1">{actionError}</p>
          <button type="button" onClick={() => setActionError('')} aria-label="סגירה">
            ✕
          </button>
        </div>
      )}

      {error ? (
        <div className="card px-6 py-10 text-center text-sm text-red-700">{describeError(error)}</div>
      ) : loading ? (
        <p className="py-20 text-center text-sm text-stone-500">טוען נתונים…</p>
      ) : (
        <GuestList
          guests={guests}
          filter={filter}
          onFilter={setFilter}
          onEdit={(guest) => setModal({ open: true, guest })}
          onDelete={remove}
          onRsvp={changeRsvp}
        />
      )}

      {modal.open && <GuestForm initial={modal.guest} onSubmit={save} onClose={closeModal} />}
    </>
  );
}
