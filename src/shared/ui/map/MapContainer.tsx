export default function MapContainer({
  children,
  size,
}: {
  children: React.ReactNode;
  size: string;
}) {
  return <div className={`relative w-full ${size} bg-black`}>{children}</div>;
}
