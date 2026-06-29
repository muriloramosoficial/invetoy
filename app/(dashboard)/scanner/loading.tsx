export default function ScannerLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded bg-bg-surface" />
      <div className="h-4 w-64 rounded bg-bg-surface" />
      <div className="max-w-sm mx-auto mt-8">
        <div className="aspect-square rounded-[6px] bg-bg-surface border border-border-default" />
        <div className="h-10 w-full rounded-[4px] bg-bg-surface mt-6" />
      </div>
    </div>
  );
}
