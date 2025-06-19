import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserLocation } from "@/store/userLocationSlice";
import type { AppDispatch } from "@/store";

export const useInitUserLocation = (isAuth: boolean) => {
  const dispatch = useDispatch<AppDispatch>();

  /**
   * Fetch the current position, run reverse-geocoding,
   * persist to localStorage and Redux.
   */
  const refreshLocation = useCallback(async () => {
    // 1️⃣  Try localStorage first
    const cached = localStorage.getItem("userLocation");
    if (cached) {
      const parsed = JSON.parse(cached);
      dispatch(setUserLocation(parsed));
      return parsed.coords; // return coords for immediate use
    }

    // 2️⃣  Fallback to geolocation only for authorised users
    if (!isAuth || !navigator.geolocation) return null;

    const position = await new Promise<GeolocationPosition>((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej),
    );

    const coords = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    // Reverse-geocode through Yandex
    const resp = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&geocode=${coords.lng},${coords.lat}&format=json`,
    );
    const data = await resp.json();
    const city =
      data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
        (c: { kind: string }) => c.kind === "locality",
      )?.name ?? null;

    // Persist
    const payload = { city, coords };
    localStorage.setItem("userLocation", JSON.stringify(payload));
    dispatch(setUserLocation(payload));

    return coords;
  }, [dispatch, isAuth]);

  /** Run once on mount */
  useEffect(() => {
    refreshLocation().catch(console.error);
  }, [refreshLocation]);

  /** Expose imperative API */
  return refreshLocation;
};
