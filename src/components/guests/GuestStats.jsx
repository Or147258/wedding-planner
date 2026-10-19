import StatCard from '../common/StatCard';
import { percent } from '../../utils/helpers';
import { SIDES } from '../../utils/constants';

function BreakdownRow({ label, total, confirmed, grand, solid, light }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-stone-500">
          <span className="font-semibold tabular-nums text-stone-800">{total}</span> מוזמנים ·{' '}
          <span className="tabular-nums">{confirmed}</span> אישרו
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-stone-100">
        <div
          className={`absolute inset-y-0 start-0 rounded-full ${light}`}
          style={{ width: `${percent(total, grand)}%` }}
        />
        <div
          className={`absolute inset-y-0 start-0 rounded-full ${solid}`}
          style={{ width: `${percent(confirmed, grand)}%` }}
        />
      </div>
    </div>
  );
}

export default function GuestStats({ stats }) {
  const { total, invitations, confirmed, undecided, declined, bySide, byCategory } = stats;

  return (
    <section className="mb-8 space-y-4" aria-label="סיכום מוזמנים">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="סך כל המוזמנים" value={total} hint={`${invitations} הזמנות`} />
        <StatCard
          label="אישרו הגעה"
          value={confirmed}
          tone="emerald"
          hint={`${percent(confirmed, total)}% מהמוזמנים`}
        />
        <StatCard label="טרם ענו / מתלבטים" value={undecided} tone="amber" hint="ממתינים לתשובה" />
        <StatCard label="לא מגיעים" value={declined} tone="red" hint="סירבו להזמנה" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">חלוקה לפי צד</h2>
          <div className="space-y-4">
            {bySide.map((s) => (
              <BreakdownRow
                key={s.key}
                label={s.label}
                total={s.total}
                confirmed={s.confirmed}
                grand={total}
                solid={SIDES[s.key].bar}
                light={SIDES[s.key].barLight}
              />
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-stone-700">חלוקה לפי קרבה</h2>
          <div className="space-y-4">
            {byCategory.map((c) => (
              <BreakdownRow
                key={c.name}
                label={c.name}
                total={c.total}
                confirmed={c.confirmed}
                grand={total}
                solid="bg-violet-500"
                light="bg-violet-200"
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-500">
        הצבע הכהה בפסים מציג את מי שאישרו הגעה, והצבע הבהיר את כלל המוזמנים.
      </p>
    </section>
  );
}
