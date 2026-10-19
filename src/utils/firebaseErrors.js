// הודעות שגיאה ידידותיות לשגיאות נפוצות של Firestore
export function describeFirebaseError(err) {
  switch (err?.code) {
    case 'permission-denied':
      return 'אין הרשאה לגשת לנתונים. בדקו את חוקי האבטחה (Rules) ב-Firestore.';
    case 'unavailable':
      return 'אין חיבור לשרת כרגע. השינויים יישמרו וייסונכרנו כשהחיבור יחזור.';
    case 'not-found':
      return 'הפריט לא נמצא — ייתכן שהוא נמחק בינתיים על ידי הצד השני.';
    default:
      return `שגיאה בתקשורת עם Firebase (${err?.code ?? 'לא ידועה'}).`;
  }
}
