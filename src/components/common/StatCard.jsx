const TONES = {
  stone: 'bg-stone-100 text-stone-600',
  rose: 'bg-rose-50 text-rose-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  sky: 'bg-sky-50 text-sky-700',
};

export default function StatCard({ label, value, hint, tone = 'stone' }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && (
        <p className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
