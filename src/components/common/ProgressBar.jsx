export default function ProgressBar({ value, color = 'bg-rose-500', label }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className="h-2.5 overflow-hidden rounded-full bg-stone-100"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
