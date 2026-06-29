export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-bg-surface" />
          <div className="h-4 w-56 rounded bg-bg-surface mt-2" />
        </div>
        <div className="h-10 w-32 rounded-[4px] bg-bg-surface" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-72 rounded-[4px] bg-bg-surface" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 rounded-[4px] bg-bg-surface" />
          ))}
        </div>
      </div>

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-14 border-b border-border-default flex items-center px-4 gap-4">
            <div className="h-4 w-20 rounded bg-bg-surface" />
            <div className="h-4 w-40 rounded bg-bg-surface" />
            <div className="h-4 w-24 rounded bg-bg-surface" />
            <div className="h-4 w-16 rounded bg-bg-surface ml-auto" />
            <div className="h-4 w-20 rounded bg-bg-surface" />
            <div className="h-6 w-16 rounded-[4px] bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
