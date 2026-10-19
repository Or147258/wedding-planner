import { useEffect } from 'react';
import { CloseIcon } from './Icons';

export default function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-b-none p-6 shadow-xl sm:rounded-b-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="סגירה">
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
