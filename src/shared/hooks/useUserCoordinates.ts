import { useMemo } from "react";
import { useAppSelector } from "@/shared/hooks/useAppSelector";

export const useUserCoordinates = () => {
  const userLocation = useAppSelector((state) => state.userLocation);

  const coords: [number, number] | null = useMemo(() => {
    if (userLocation.coords) {
      return [userLocation.coords.lat, userLocation.coords.lng];
    }
    return null;
  }, [userLocation.coords]);

  const city = userLocation.city;
  const isLoading = !userLocation.coords;
  const error = userLocation.error ?? null;

  return { coords, city, isLoading, error };
};
