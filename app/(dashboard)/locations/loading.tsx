export default function LocationsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-44 rounded bg-bg-surface" />
        <div className="h-10 w-36 rounded-[4px] bg-bg-surface" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 rounded-[6px] bg-bg-surface border border-border-default" />
        ))}
      </div>
    </div>
  );
}
