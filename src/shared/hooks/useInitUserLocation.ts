import { useEffect } from "react";
import { setUserLocation } from "@/store/userLocationSlice";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";

export const useInitUserLocation = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // обратный геокодинг через Yandex
      const res = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&geocode=${coords.lng},${coords.lat}&format=json`,
      );
      const data = await res.json();
      const city =
        data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
          (c: { kind: string }) => c.kind === "locality",
        )?.name || null;

      dispatch(setUserLocation({ city, coords }));
    });
  }, []);
};
