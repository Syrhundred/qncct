import { useEffect, useState } from "react";

type Coordinates = [number, number];
type PixelCoordinates = { x: number; y: number };

export const useMapPixelCoordinates = (
  mapRef: React.MutableRefObject<any>,
  coords: Coordinates | null,
): PixelCoordinates | null => {
  const [pixelCoords, setPixelCoords] = useState<PixelCoordinates | null>(null);

  useEffect(() => {
    if (!mapRef.current || !coords) return;

    const updatePixel = () => {
      const [x, y] = mapRef.current.converter.globalToPage(coords);
      setPixelCoords({ x, y });
    };

    updatePixel();

    mapRef.current.events.add("boundschange", updatePixel);

    return () => {
      mapRef.current.events.remove("boundschange", updatePixel);
    };
  }, [coords, mapRef]);

  return pixelCoords;
};
