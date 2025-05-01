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
  const userLocationZoom = 16;
  const normalizeCoordinates = (
    lng: number | string,
    ltd: number | string,
  ): [number, number] => {
    const latitude = typeof ltd === "string" ? parseFloat(ltd) : ltd;
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
    return [latitude, longitude]; // ✔️ Yandex: [lng, lat]
  };

  useEffect(() => {
    if (mapRef.current && userCoords) {
      mapRef.current?.setCenter(userCoords, ZOOM);
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

  // Function to center map on user location
  const centerOnUserLocation = () => {
    console.log(userCoords);
    if (mapRef.current && userCoords) {
      mapRef.current.setCenter(userCoords, userLocationZoom);
    }
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

        {/* 🔵 User Location Marker */}
        {userCoords && (
          <Placemark
            geometry={userCoords}
            properties={{
              hintContent: "Your location",
              balloonContent: "You are here",
            }}
            options={{
              preset: "islands#blueCircleDotIcon", // Blue dot with outer circle
              iconColor: "#4F46E5", // Indigo color matching the button
              zIndex: 1000, // Make sure it appears above other markers
            }}
          />
        )}

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

      {/* Location button */}
      <button
        onClick={centerOnUserLocation}
        className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
        aria-label="Center on my location"
        disabled={isUserLocationLoading || !userCoords}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    </MapContainer>
  );
}
