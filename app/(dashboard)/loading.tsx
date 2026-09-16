export default function DashboardLoading() {
  return (
    <main className="page-shell" aria-label="Loading page" aria-busy="true">
      <div className="space-y-2 py-1">
        <div className="h-3 w-28 animate-pulse rounded-full bg-daylog-lavender-strong/60" />
        <div className="h-9 w-44 animate-pulse rounded-2xl bg-foreground/10" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">
        {["bg-daylog-blue xl:col-span-7", "bg-daylog-lavender xl:col-span-5", "bg-daylog-peach xl:col-span-5", "bg-daylog-pink xl:col-span-7"].map((className) => (
          <div key={className} className={`h-64 animate-pulse rounded-[var(--daylog-radius-card)] opacity-65 shadow-[var(--daylog-shadow)] ${className}`}>
            <span className="m-6 block size-11 rounded-2xl bg-white/45 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </main>
  );
}
