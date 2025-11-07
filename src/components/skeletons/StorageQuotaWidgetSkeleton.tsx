export default function StorageQuotaWidgetSkeleton() {
  return (
    <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 animate-pulse">
      <div className="h-6 bg-zinc-200 rounded w-1/3 mb-3"></div>
      <div className="h-2.5 bg-zinc-200 rounded-full mb-2"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-zinc-200 rounded w-1/4"></div>
        <div className="h-4 bg-zinc-200 rounded w-1/6"></div>
      </div>
    </div>
  );
}
