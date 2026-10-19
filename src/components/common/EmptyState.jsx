export default function EmptyState({ title, text, children }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <p className="text-base font-semibold">{title}</p>
      {text && <p className="max-w-sm text-sm text-stone-500">{text}</p>}
      {children && <div className="mt-2 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
