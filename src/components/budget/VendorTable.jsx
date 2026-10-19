import { PencilIcon, TrashIcon } from '../common/Icons';
import { formatCurrency, sumBy } from '../../utils/helpers';

export default function VendorTable({ vendors, onEdit, onDelete }) {
  const total = sumBy(vendors, (v) => v.total);
  const paid = sumBy(vendors, (v) => v.paid);
  const balance = total - paid;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>
              <th className="th">ספק / שירות</th>
              <th className="th">עלות כוללת</th>
              <th className="th">מקדמה ששולמה</th>
              <th className="th">יתרה לתשלום</th>
              <th className="th w-24">
                <span className="sr-only">פעולות</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {vendors.map((v) => {
              const rest = v.total - v.paid;
              return (
                <tr key={v.id} className="hover:bg-stone-50/60">
                  <td className="td">
                    <p className="font-medium">{v.name}</p>
                    {v.type && <p className="text-xs text-stone-500">{v.type}</p>}
                  </td>
                  <td className="td tabular-nums">{formatCurrency(v.total)}</td>
                  <td className="td tabular-nums">{formatCurrency(v.paid)}</td>
                  <td className="td">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium tabular-nums ${
                        rest > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {rest > 0 ? formatCurrency(rest) : 'שולם במלואו'}
                    </span>
                  </td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => onEdit(v)}
                        aria-label={`עריכת ${v.name}`}
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => onDelete(v)}
                        aria-label={`מחיקת ${v.name}`}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-stone-200 bg-stone-50 font-semibold">
            <tr>
              <td className="td">סה״כ</td>
              <td className="td tabular-nums">{formatCurrency(total)}</td>
              <td className="td tabular-nums">{formatCurrency(paid)}</td>
              <td className="td tabular-nums">{formatCurrency(balance)}</td>
              <td className="td" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
