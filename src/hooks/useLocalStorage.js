import { useEffect, useState } from 'react';

// state שנשמר אוטומטית ב-localStorage, כך שהנתונים שורדים רענון של הדף
export default function useLocalStorage(key, initialValue) {
  const fullKey = `wedding-planner.${key}`;

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(value));
    } catch {
      /* אחסון מלא או חסום — ממשיכים בלי לשמור */
    }
  }, [fullKey, value]);

  return [value, setValue];
}
