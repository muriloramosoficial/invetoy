export default function MovementsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 rounded bg-bg-surface" />
        <div className="h-10 w-32 rounded-[4px] bg-bg-surface" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-60 rounded-[4px] bg-bg-surface" />
        <div className="h-10 w-40 rounded-[4px] bg-bg-surface" />
      </div>
      <div className="rounded-[6px] border border-border-default overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-14 border-b border-border-default flex items-center px-4 gap-4">
            <div className="h-4 w-24 rounded bg-bg-surface" />
            <div className="h-4 w-32 rounded bg-bg-surface" />
            <div className="h-4 w-20 rounded bg-bg-surface" />
            <div className="h-4 w-16 rounded bg-bg-surface ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
