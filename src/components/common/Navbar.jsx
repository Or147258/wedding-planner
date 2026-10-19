export default function Navbar({ tabs, active }) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4">
        <div className="py-3">
          <p className="text-lg font-semibold tracking-tight">
            אור <span className="text-rose-500">♥</span> עדן
          </p>
          <p className="-mt-0.5 text-xs text-stone-500">תכנון החתונה</p>
        </div>

        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="ניווט ראשי">
          {tabs.map((tab) => {
            const isActive = tab.id === active;
            return (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition ${
                  isActive
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
