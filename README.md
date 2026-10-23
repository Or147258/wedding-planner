# תכנון החתונה – אור ועדן

אפליקציית ווב לניהול חתונה: **React + Tailwind CSS + Firebase (Auth + Firestore)**, בעברית ובכיוון RTL.
כל הנתונים נשמרים ב-Firestore ומסתנכרנים בזמן אמת בין המכשירים (`onSnapshot`).

## הדפים

| דף | מה יש בו |
|----|----------|
| **מוזמנים** | טיימר ספירה לאחור לחתונה · דשבורד (סה״כ, אישרו, חלוקה לפי צד / קרבה / מנות מיוחדות) · כפתורי סינון לפי הצד · טבלה להוספה/עריכה/מחיקה · אייקון וואטסאפ ליד הטלפון · ייצוא לאקסל |
| **תקציב וספקים** | סיכום הוצאות/מקדמות/יתרה · טבלת ספקים עם תאריך יעד לתשלום היתרה (עם סימון איחור) · ייצוא לאקסל |
| **משימות** | צ'קליסט עם תאריך יעד וסימון V |
| **סידורי הושבה** | הגדרת שולחנות · שיוך מוזמנים שאישרו הגעה (גרירה או בחירה) עם חיווי מקומות פנויים · ייצוא לאקסל (לפי שולחנות ולפי אלף-בית) |

ארבעת הצדדים: **צד החתן (אור)**, **צד הכלה (עדן)**, **הוריי החתן**, **הוריי הכלה**.

מנות מיוחדות נספרות לפי כמות בכל הזמנה (למשל משפחה של 4: צמחוני ×1, מנת ילדים ×2), ושאר המוזמנים נחשבים מנה רגילה.

## הרצה מקומית

דרישות: Node.js 18 ומעלה.

```bash
npm install
npm run dev
```

## הגדרת Firebase (חד-פעמית)

1. ב-[Firebase Console](https://console.firebase.google.com) צרו פרויקט.
2. **Firestore Database ← Create database** (מצב Production).
3. **Authentication ← Sign-in method ← Email/Password**: הפעילו, ובלשונית **Users** הוסיפו משתמש לאור ומשתמש לעדן.
4. **Project settings ← Your apps ← Web (`</>`)**: רשמו אפליקציה והעתיקו את `firebaseConfig`.
5. הדביקו את הערכים ב-`src/firebase.js` (בין הגרשיים), **או** הגדירו אותם כמשתני סביבה `VITE_FIREBASE_*` (ראו `.env.example`).
6. **Firestore ← Rules**: הדביקו את `firestore.rules`, **החליפו את שתי הכתובות בכתובות המייל האמיתיות שלכם (באותיות קטנות)** ולחצו Publish.

## פריסה ל-Vercel

1. העלו את התיקייה ל-GitHub (או השתמשו ב-Vercel CLI).
2. ב-[Vercel](https://vercel.com) לחצו **Add New ← Project** ובחרו את המאגר. Vercel מזהה לבד Vite:
   Build Command `npm run build`, Output Directory `dist`.
3. אם לא הדבקתם את המפתחות ב-`src/firebase.js`: ב-**Settings ← Environment Variables** הוסיפו את ששת משתני `VITE_FIREBASE_*` (לפני הפריסה).
4. **חשוב:** ב-Firebase ← Authentication ← Settings ← **Authorized domains** הוסיפו את הדומיין של Vercel (למשל `my-wedding.vercel.app`). בלי זה ההתחברות תיכשל.

## מבנה הנתונים ב-Firestore

```
guests/{id}   vendors/{id}   tasks/{id}   tables/{id}
settings/categories  →  { list: [...] }
settings/wedding     →  { date: 'YYYY-MM-DD', time: 'HH:MM' }
```

## אבטחה

מפתחות `firebaseConfig` אינם סוד. ההגנה היא מסך ההתחברות וחוקי `firestore.rules`, שמאפשרים גישה רק לשתי כתובות המייל שלכם.
אל תשתמשו ב-`allow read, write: if true`.

## מבנה הפרויקט

```
src/
├── firebase.js            # אתחול Firebase + Auth (המפתחות)
├── App.jsx                # מסך הגדרה / התחברות / האפליקציה
├── WeddingApp.jsx         # האזנה ל-Firestore, פעולות CRUD, ניווט בין הדפים
├── services/weddingApi.js # כתיבה/עדכון/מחיקה מול Firestore
├── hooks/useFirestore.js  # onSnapshot (אוספים, קטגוריות, תאריך החתונה)
├── pages/                 # GuestsPage, BudgetPage, TasksPage, SeatingPage
├── components/
│   ├── auth/              # AuthGate (התחברות)
│   ├── common/            # Navbar, Modal, StatCard, Icons...
│   ├── guests/            # Countdown, GuestStats, GuestForm, GuestTable
│   ├── budget/            # VendorForm, VendorTable
│   ├── tasks/             # TaskForm, TaskItem
│   └── seating/           # TableForm, TableCard, UnassignedList
└── utils/                 # constants, helpers, guestStats, exportExcel, whatsapp, dnd
```

## התאמות נפוצות

- **תוויות הצדדים, מנות, קטגוריות, טקסט הוואטסאפ**: `src/utils/constants.js`.
- **תאריך החתונה**: בכפתור העיפרון בטיימר, בראש דף המוזמנים.
