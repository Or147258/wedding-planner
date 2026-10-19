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

## שמירת נתונים

כל הנתונים נשמרים ב-`localStorage` של הדפדפן, כלומר הם נשארים גם אחרי רענון, אך קיימים רק במחשב ובדפדפן שבהם הוזנו.
כדי לעבוד מכמה מכשירים או לשתף עם בן/בת הזוג יהיה צורך להוסיף שרת/מסד נתונים (למשל Firebase או Supabase).
את הנתונים אפשר לגבות בעזרת כפתורי "ייצוא לאקסל".

## ייצוא לאקסל

הייצוא נעשה בעזרת הספרייה [`xlsx`](https://www.npmjs.com/package/xlsx) (SheetJS), בקובץ `src/utils/exportExcel.js`.
הקבצים נוצרים עם כיוון קריאה מימין לשמאל. כדי לייצא CSV במקום xlsx מספיק לשנות את סיומת שם הקובץ ל-`.csv` בקריאה ל-`exportSheets`.

## מבנה הפרויקט

```
src/
├── App.jsx                  # state מרכזי, ניווט בין הדפים
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
├── hooks/useLocalStorage.js
└── utils/                   # constants, helpers, guestStats, exportExcel, dnd
```

## התאמות נפוצות

- **שמות ברירת המחדל** (אור ♥ עדן): `src/components/common/Navbar.jsx` ו-`src/utils/constants.js` (תוויות הצדדים).
- **קטגוריות ברירת מחדל**: `DEFAULT_CATEGORIES` ב-`src/utils/constants.js`.
- **משימות מוצעות**: `STARTER_TASKS` באותו קובץ.
- **צבעים**: הצבע הראשי הוא `rose` של Tailwind; אפשר להחליף אותו בחיפוש-והחלפה.
