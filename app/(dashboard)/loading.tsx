export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-48 rounded bg-bg-surface" />
        <div className="h-4 w-72 rounded bg-bg-surface mt-2" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-[6px] bg-bg-surface border border-border-default" />
        ))}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-80 rounded-[6px] bg-bg-surface border border-border-default md:col-span-2" />
        <div className="h-80 rounded-[6px] bg-bg-surface border border-border-default" />
        <div className="h-80 rounded-[6px] bg-bg-surface border border-border-default" />
      </div>
    </div>
  );
}
