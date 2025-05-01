export default function MapContainer({
  children,
  size,
}: {
  children: React.ReactNode;
  size: string;
}) {
  return (
    <div
      className={`relative w-full ${size} bg-black overflow-hidden`}
      style={{ overscrollBehavior: "none" }}
    >
      {children}
    </div>
  );
}
