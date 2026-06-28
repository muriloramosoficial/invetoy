export default function ReportsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded bg-bg-surface" />
      <div className="h-4 w-72 rounded bg-bg-surface" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 rounded-[6px] bg-bg-surface border border-border-default" />
        ))}
      </div>
    </div>
  );
}
