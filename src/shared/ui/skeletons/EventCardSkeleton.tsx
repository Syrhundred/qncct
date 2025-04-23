export default function EventCardSkeleton() {
  return (
    <div className="w-[300px] h-[309px] bg-gray-100 rounded-[10px] animate-pulse">
      <div className="w-full h-1/2 bg-gray-300 rounded-t-[10px]" />
      <div className="p-4 space-y-2">
        <div className="w-3/4 h-4 bg-gray-300 rounded" />
        <div className="w-1/2 h-4 bg-gray-300 rounded" />
        <div className="w-1/3 h-4 bg-gray-300 rounded" />
      </div>
    </div>
  );
}
