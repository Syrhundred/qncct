// src/shared/ui/skeletons/EventSkeleton.tsx
export default function EventSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-64 bg-gray-300" />
      <div className="absolute top-52 w-full rounded-t-[20px] bg-white pt-6 p-3 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="flex justify-between text-xs">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
        <div className="h-[250px] bg-gray-200 rounded" />
      </div>
    </div>
  );
}
