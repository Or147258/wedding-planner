import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const byCreated = (a, b) =>
  (a.createdAt ?? 0) - (b.createdAt ?? 0) || a.name.localeCompare(b.name, 'he');

// מאזין בזמן אמת (onSnapshot) לאוסף guests — כל שינוי, שלי או של עדן, מגיע לכאן מיד
export default function useGuests() {
  const [state, setState] = useState({ guests: [], loading: true, error: null });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'guests'),
      (snap) => {
        const guests = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byCreated);
        setState({ guests, loading: false, error: null });
      },
      (error) => setState((s) => ({ ...s, loading: false, error }))
    );
    return unsubscribe; // ניקוי ההאזנה כשהקומפוננטה יורדת מהמסך
  }, []);

  return state;
}
