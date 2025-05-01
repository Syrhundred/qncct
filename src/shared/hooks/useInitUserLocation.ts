import { useEffect } from "react";
import { setUserLocation } from "@/store/userLocationSlice";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";

export const useInitUserLocation = (isAuth: boolean) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Проверяем наличие данных в localStorage
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      const { city, coords } = JSON.parse(storedLocation);
      dispatch(setUserLocation({ city, coords }));
    } else if (isAuth) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Обратный геокодинг через Yandex
        const res = await fetch(
          `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&geocode=${coords.lng},${coords.lat}&format=json`,
        );
        const data = await res.json();
        const city =
          data.response.GeoObjectCollection.featureMember[0]?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components?.find(
            (c: { kind: string }) => c.kind === "locality",
          )?.name || null;

        // Сохраняем данные в localStorage
        localStorage.setItem("userLocation", JSON.stringify({ city, coords }));

        // Диспатчим данные в Redux
        dispatch(setUserLocation({ city, coords }));
      });
    }
  }, [dispatch, isAuth]);
};
