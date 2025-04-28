"use client";

import { Map as YandexMap, Placemark, useYMaps } from "@pbe/react-yandex-maps";
import type { Map as YMapType } from "yandex-maps";
import type { MapEvent, IEvent } from "yandex-maps";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { useEffect, useRef, useState } from "react";
import { IGeocodeResult } from "yandex-maps";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { fetchEvents } from "@/store/eventSlice";
import { useUserCoordinates } from "@/shared/hooks/useUserCoordinates";
import MapContainer from "@/shared/ui/map/MapContainer";

interface IAddress {
  location: string;
  route: string;
}

export default function GeocodeMap({
  containerSize,
  currentEvent,
  selectedInterests,
}: {
  containerSize: string;
  currentEvent?: [number, number];
  selectedInterests?: string[];
}) {
  const ymaps = useYMaps(["geocode"]);
  const mapRef = useRef<YMapType | undefined>(undefined);
  const dispatch = useDispatch<AppDispatch>();

  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<IAddress | null>(null);
  console.log(coordinates, address); // TODO: USE them

  const events = useAppSelector((state) => state.event.events);
  const { coords: userCoords, isLoading: isUserLocationLoading } =
    useUserCoordinates();
  console.log(isUserLocationLoading); // TODO: USE IT

  const FALLBACK_CENTER: [number, number] = [43.238, 76.886]; // Алматы
  const ZOOM = 12;
  const normalizeCoordinates = (
    lng: number | string,
    ltd: number | string,
  ): [number, number] => {
    const latitude = typeof ltd === "string" ? parseFloat(ltd) : ltd;
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
    return [latitude, longitude]; // ✔️ Yandex: [lng, lat]
  };

  // Центрируем карту, когда userCoords загрузились
  useEffect(() => {
    if (mapRef.current && userCoords) {
      mapRef.current.setCenter(userCoords, ZOOM);
    }
  }, [userCoords]);

  useEffect(() => {
    if (selectedInterests && selectedInterests.length > 0) {
      dispatch(fetchEvents({ interests: selectedInterests }));
    } else {
      dispatch(fetchEvents());
    }
  }, [dispatch, selectedInterests]);

  const handleClickMap = (e: MapEvent<IEvent>) => {
    const coords = e.get("coords") as [number, number];
    if (coords) {
      setCoordinates(coords);
    }

    if (ymaps) {
      ymaps.geocode(coords).then((result) => {
        const foundAddress = handleGeoResult(result);
        if (foundAddress) {
          setAddress(foundAddress);
        } else {
          console.error("GeoCode failed");
          setAddress(null);
        }
      });
    }
  };

  const handleGeoResult = (result: IGeocodeResult) => {
    const firstGeoObject = result.geoObjects.get(0);
    if (firstGeoObject) {
      const properties = firstGeoObject.properties;
      const location = String(properties.get("description", {}));
      const route = String(properties.get("name", {}));
      return { location, route };
    }
    return null;
  };

  return (
    <MapContainer size={containerSize}>
      <YandexMap
        instanceRef={mapRef}
        defaultState={{
          center: currentEvent ?? FALLBACK_CENTER,
          zoom: ZOOM,
        }}
        width="100%"
        height="100%"
        onClick={handleClickMap}
        options={{
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
        }}
      >
        {/* 🟢 Метка по клику */}
        {/*{coordinates && (*/}
        {/*  <Placemark*/}
        {/*    geometry={coordinates}*/}
        {/*    options={{*/}
        {/*      iconColor: "#ff0000",*/}
        {/*      preset: "islands#dotIcon",*/}
        {/*    }}*/}
        {/*    properties={{*/}
        {/*      balloonContent: "Вы нажали сюда!",*/}
        {/*    }}*/}
        {/*  />*/}
        {/*)}*/}

        {/* 🔵 Метки всех ивентов */}
        {events.map((event) => {
          if (!event.latitude || !event.longitude) return null;
          const coords = normalizeCoordinates(event.longitude, event.latitude);
          return (
            <Placemark
              key={event.id}
              geometry={coords}
              properties={{
                iconContent: `<div
              className="scale-0 opacity-0 animate-[bounceIn_0.5s_ease_forwards]"
                style={{animationName: 'bounceIn'}}>${event.name}</div>`,
                hintContent: event.name,
                balloonContentHeader: `<b>${event.name}</b>`,
                balloonContentBody: `<div><img alt="balloon" src="${event.images[0]?.url}" width="100%" /><p>${event.date}</p></div>`,
                balloonContentFooter: `<small>${event.date}</small>`,
              }}
              options={{
                iconLayout: "default#image",
                iconImageHref: "https://img.icons8.com/color/48/marker.png",
                iconImageSize: [32, 32],
                iconImageOffset: [-16, -42],
                balloonCloseButton: true,
                hideIconOnBalloonOpen: false,
                balloonMaxWidth: 300,
              }}
            />
          );
        })}
      </YandexMap>
    </MapContainer>
  );
}
