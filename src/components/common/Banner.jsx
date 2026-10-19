import { CloseIcon } from './Icons';

const TONES = {
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  red: 'border-red-200 bg-red-50 text-red-800',
  sky: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function Banner({ tone = 'amber', onClose, children }) {
  return (
    <div
      role="alert"
      className={`mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${TONES[tone]}`}
    >
      <div className="flex-1">{children}</div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="סגירה" className="opacity-60 hover:opacity-100">
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
