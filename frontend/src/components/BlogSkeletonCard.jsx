export default function BlogSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-20 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
          <div className="h-3 bg-slate-100 rounded w-3/4" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200" />
            <div className="h-3 w-20 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-16 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}
