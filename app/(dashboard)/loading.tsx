export default function DashboardLoading() {
  return (
    <main className="page-shell" aria-label="Loading page">
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
    </main>
  );
}
