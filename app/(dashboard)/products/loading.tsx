export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded bg-bg-surface" />
          <div className="h-4 w-56 rounded bg-bg-surface mt-2" />
        </div>
        <div className="h-10 w-36 rounded-[4px] bg-bg-surface" />
      </div>

      <div className="h-10 w-72 rounded-[4px] bg-bg-surface" />

      <div className="rounded-[6px] border border-border-default overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-border-default flex items-center px-4 gap-4">
            <div className="h-4 w-24 rounded bg-bg-surface" />
            <div className="h-4 w-36 rounded bg-bg-surface" />
            <div className="h-4 w-20 rounded bg-bg-surface" />
            <div className="h-4 w-12 rounded bg-bg-surface" />
            <div className="h-4 w-16 rounded bg-bg-surface ml-auto" />
            <div className="h-4 w-16 rounded bg-bg-surface" />
            <div className="h-4 w-12 rounded bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
