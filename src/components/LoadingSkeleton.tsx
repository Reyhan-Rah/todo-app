import { cn } from '@/lib/utils'

const LoadingSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "p-4 bg-white border rounded-lg shadow-sm",
            "animate-pulse"
          )}
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
  )
}

export default LoadingSkeleton
