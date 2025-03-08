import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="container py-10 space-y-8">
      <div className="flex justify-between items-center">
        <LoadingSkeleton height="h-10" width="w-64" />
        <LoadingSkeleton height="h-10" width="w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass-card p-6 rounded-lg neon-border space-y-4"
          >
            <LoadingSkeleton height="h-6" width="w-32" />
            <LoadingSkeleton height="h-12" width="w-full" />
            <LoadingSkeleton height="h-4" width="w-3/4" />
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-lg neon-border space-y-4">
        <LoadingSkeleton height="h-8" width="w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} height="h-16" width="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
