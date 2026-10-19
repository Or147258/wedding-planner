import * as XLSX from 'xlsx';

/**
 * מייצא קובץ Excel (xlsx) עם גיליון אחד או יותר.
 *
 * @param {string} filename  שם הקובץ, למשל 'רשימת_מוזמנים.xlsx'
 * @param {Array<{name: string, rows: object[], header?: string[], widths?: number[]}>} sheets
 *   - rows: מערך אובייקטים, המפתחות הם כותרות העמודות
 *   - header: סדר עמודות מפורש (כדי שגם גיליון ריק יכיל כותרות)
 *   - widths: רוחב עמודות (בתווים)
 *
 * לייצוא CSV במקום Excel מספיק לשנות את סיומת הקובץ ל-.csv — הספרייה תזהה לבד.
 */
export function exportSheets(filename, sheets) {
  const wb = XLSX.utils.book_new();
  wb.Workbook = { Views: [{ RTL: true }] }; // כיוון קריאה מימין לשמאל

  sheets.forEach(({ name, rows, header, widths }) => {
    const ws = XLSX.utils.json_to_sheet(rows, header ? { header } : undefined);
    if (widths) ws['!cols'] = widths.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, filename);
}
