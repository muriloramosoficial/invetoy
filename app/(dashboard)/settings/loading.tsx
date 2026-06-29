export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-2xl">
      <div>
        <div className="h-8 w-40 rounded bg-bg-surface" />
        <div className="h-4 w-64 rounded bg-bg-surface mt-2" />
      </div>
      <div className="rounded-[6px] border border-border-default p-6 space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-28 rounded bg-bg-surface mb-2" />
            <div className="h-10 w-full rounded-[4px] bg-bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
