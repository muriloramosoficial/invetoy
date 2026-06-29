export default function SubscriptionLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl">
      <div className="h-8 w-52 rounded bg-bg-surface" />
      <div className="h-4 w-80 rounded bg-bg-surface" />
      <div className="p-6 rounded-lg border border-brand-20 bg-brand-3">
        <div className="h-5 w-40 rounded bg-bg-surface mb-2" />
        <div className="h-4 w-64 rounded bg-bg-surface" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 rounded-[6px] bg-bg-surface border border-border-default" />
        ))}
      </div>
    </div>
  );
}
