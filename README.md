# תכנון החתונה – אור ועדן

אפליקציית ווב לניהול חתונה, בנויה ב-**React + Tailwind CSS** (עם Vite), בעברית מלאה ובכיוון RTL.

## מה יש באפליקציה

| דף | תכונות |
|----|--------|
| **מוזמנים** | טבלה להוספה/עריכה/מחיקה, צד (חתן-אור / כלה-עדן), קרבה עם הוספת קטגוריות חדשות, סטטוס RSVP, דשבורד מספרי (סה״כ, אישרו הגעה, חלוקה לפי צד וקרבה), חיפוש וסינון, ייצוא לאקסל |
| **תקציב וספקים** | טבלת ספקים עם עלות כוללת, מקדמה ויתרה, סיכום הוצאות/מקדמות/יתרה, ייצוא לאקסל |
| **משימות** | צ'קליסט עם סימון V, תאריך יעד, סימון איחורים, התקדמות, משימות מוצעות להתחלה |
| **סידורי הושבה** | הגדרת שולחנות (גם כמה ברצף), גרירה או בחירה מרשימה לשיוך מוזמנים שאישרו הגעה, חיווי ויזואלי של מקומות פנויים, ייצוא לפי שולחנות ולפי אלף-בית |

## הרצה מקומית

דרישות: [Node.js](https://nodejs.org) גרסה 18 ומעלה.

```bash
cd wedding-planner
npm install
npm run dev
```

לאחר מכן פתחו בדפדפן את הכתובת שמוצגת בטרמינל (בדרך כלל http://localhost:5173).

בנייה לפרודקשן: `npm run build` (התוצאה נוצרת בתיקיית `dist`), ובדיקה מקומית שלה: `npm run preview`.

## שמירת נתונים וסנכרון בזמן אמת (Firebase / Firestore)

הנתונים נשמרים ב-**Firestore** ומסתנכרנים בזמן אמת בין כל המכשירים (`onSnapshot`).
שינוי שאחד מכם עושה מופיע אצל השני תוך רגע, ואפשר להמשיך לעבוד גם בלי אינטרנט — השינויים מסתנכרנים כשהחיבור חוזר.

### הגדרה חד-פעמית

1. ב-[Firebase Console](https://console.firebase.google.com) צרו פרויקט.
2. **Build ← Firestore Database ← Create database** (מצב Production, ובחרו אזור קרוב, למשל `europe-west1`).
3. **Build ← Authentication ← Get started ← Email/Password**: הפעילו, ואז בלשונית **Users** הוסיפו משתמש לאור ומשתמש לעדן (אימייל + סיסמה).
4. **Project settings ← Your apps ← Web (`</>`)**: רשמו את האפליקציה והעתיקו את אובייקט `firebaseConfig`.
5. הדביקו את הערכים בקובץ `src/firebase.js`.
6. **Firestore ← Rules**: הדביקו את תוכן `firestore.rules`, **החליפו את שתי הכתובות בכתובות האמיתיות שלכם (באותיות קטנות)** ולחצו Publish.
7. `npm install` ואז `npm run dev`, והתחברו עם אחד המשתמשים.

### מבנה הנתונים

```
guests/{id}   vendors/{id}   tasks/{id}   tables/{id}
settings/categories  →  { list: [...] }
```

### אבטחה

מפתחות `firebaseConfig` אינם סוד: הם נחשפים בקוד שרץ בדפדפן. ההגנה האמיתית היא:

- **מסך התחברות** (Email/Password) — האפליקציה נטענת רק למשתמש מחובר.
- **חוקי Firestore** (`firestore.rules`) — מאפשרים קריאה וכתיבה רק לשתי כתובות המייל שלכם. גם מי שיצליח ליצור משתמש אחר לא יראה את הנתונים.

אל תשתמשו ב-`allow read, write: if true` — כך כל מי שמכיר את כתובת האתר יכול לקרוא ולמחוק את הרשימה.

### ייבוא נתונים מהגרסה הקודמת

אם יש לכם נתונים שהוזנו בגרסת ה-localStorage, בכניסה הראשונה (כש-Firestore ריק) יופיע באנר ״ייבוא ל-Firebase״.
הייבוא רץ מהדפדפן שבו הוזנו הנתונים. את הנתונים אפשר לגבות גם בעזרת כפתורי "ייצוא לאקסל".

## ייצוא לאקסל

הייצוא נעשה בעזרת הספרייה [`xlsx`](https://www.npmjs.com/package/xlsx) (SheetJS), בקובץ `src/utils/exportExcel.js`.
הקבצים נוצרים עם כיוון קריאה מימין לשמאל. כדי לייצא CSV במקום xlsx מספיק לשנות את סיומת שם הקובץ ל-`.csv` בקריאה ל-`exportSheets`.

## מבנה הפרויקט

```
src/
├── firebase.js              # אתחול Firebase + Auth — כאן מדביקים את המפתחות
├── App.jsx                  # מסך הגדרה אם אין מפתחות, אחרת התחברות ואז האפליקציה
├── WeddingApp.jsx           # האזנה ל-Firestore, פעולות CRUD, ניווט בין הדפים
├── services/weddingApi.js   # כתיבה/עדכון/מחיקה מול Firestore
├── pages/
│   ├── GuestsPage.jsx
│   ├── BudgetPage.jsx
│   ├── TasksPage.jsx
│   └── SeatingPage.jsx
├── components/
│   ├── common/              # Navbar, Modal, StatCard, ProgressBar, Icons...
│   ├── guests/              # GuestStats, GuestForm, GuestTable
│   ├── budget/              # VendorForm, VendorTable
│   ├── tasks/               # TaskForm, TaskItem
│   └── seating/             # TableForm, TableCard, UnassignedList
├── hooks/useFirestore.js    # onSnapshot לכל אוסף
└── utils/                   # constants, helpers, guestStats, exportExcel, dnd, migrateLocalData
```

## התאמות נפוצות

- **שמות ברירת המחדל** (אור ♥ עדן): `src/components/common/Navbar.jsx` ו-`src/utils/constants.js` (תוויות הצדדים).
- **קטגוריות ברירת מחדל**: `DEFAULT_CATEGORIES` ב-`src/utils/constants.js`.
- **משימות מוצעות**: `STARTER_TASKS` באותו קובץ.
- **צבעים**: הצבע הראשי הוא `rose` של Tailwind; אפשר להחליף אותו בחיפוש-והחלפה.
