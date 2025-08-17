import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  count?: number;
}

const LoadingSkeleton = ({ count = 5 }: LoadingSkeletonProps) => {
  const safeCount = count ?? 5; // Handle null and undefined
  return (
    <div data-testid="skeleton-container" className="space-y-3">
      {Array.from({ length: Math.max(0, safeCount) }).map((_, index) => (
        <div
          key={index}
          data-testid="skeleton-item"
          className={cn(
            'h-16 bg-gray-200 rounded-lg animate-pulse',
            'p-4 bg-white border rounded-lg shadow-sm'
          )}
          aria-hidden="true"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="w-16 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
