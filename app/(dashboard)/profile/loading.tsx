export default function ProfileLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-lg">
      <div className="h-8 w-36 rounded bg-bg-surface" />
      <div className="h-4 w-56 rounded bg-bg-surface" />
      <div className="rounded-[6px] border border-border-default p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 rounded bg-bg-surface mb-2" />
            <div className="h-10 w-full rounded-[4px] bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
