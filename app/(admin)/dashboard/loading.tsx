// Shown instantly inside the dashboard shell while the next page loads,
// so a tap on slow internet never looks like nothing happened.
export default function DashboardLoading() {
  const block = "animate-pulse bg-[var(--color-card)]";
  return (
    <div aria-busy="true" aria-label="جاري التحميل">
      <div className="mb-6 space-y-2">
        <div className={`${block} h-8 w-40`} />
        <div className={`${block} h-4 w-64 max-w-full`} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${block} h-28`} />
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${block} h-20`} />
        ))}
      </div>
    </div>
  );
}
