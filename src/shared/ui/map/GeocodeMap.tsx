"use client";

import { Map as YandexMap, Placemark } from "@pbe/react-yandex-maps";
import type { Map as YMapType } from "yandex-maps";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { useEffect, useRef, useState } from "react";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import { fetchEvents } from "@/store/eventSlice";
import { useUserCoordinates } from "@/shared/hooks/useUserCoordinates";
import MapContainer from "@/shared/ui/map/MapContainer";
import { IEvent } from "@/shared/types/types";
import { LocateFixed } from "lucide-react";
import EventCard from "@/shared/ui/event-card/EventCard";

export default function GeocodeMap({
  containerSize,
  currentEvent,
  selectedInterests,
  isEvent,
}: {
  containerSize: string;
  currentEvent?: [number, number];
  selectedInterests?: string[];
  isEvent: boolean;
}) {
  const mapRef = useRef<YMapType | undefined>(undefined);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [detailsPanelState, setDetailsPanelState] = useState("closed");
  const [activePlacemark, setActivePlacemark] = useState<number | null>(null);

  const events = useAppSelector((state) => state.event.events);
  const { coords: userCoords, isLoading: isUserLocationLoading } =
    useUserCoordinates();

  const FALLBACK_CENTER: [number, number] = [43.238, 76.886];
  const ZOOM = 12;
  const userLocationZoom = 16;

  const normalizeCoordinates = (
    lng: number | string,
    ltd: number | string,
  ): [number, number] => {
    const latitude = typeof ltd === "string" ? parseFloat(ltd) : ltd;
    const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
    return [latitude, longitude];
  };

  useEffect(() => {
    if (selectedInterests && selectedInterests.length > 0) {
      dispatch(fetchEvents({ interests: selectedInterests }));
    } else {
      dispatch(fetchEvents());
    }
  }, [dispatch, selectedInterests]);

  useEffect(() => {
    if (mapRef.current && userCoords) {
      mapRef.current.setCenter(userCoords, ZOOM);
    }
  }, [userCoords]);

  const handleClickMap = () => {
    if (showEventDetails) closeEventDetails();
    setActivePlacemark(null);
  };

  const handleEventClick = (event: IEvent) => {
    if (event.id !== undefined) {
      const eventId = Number(event.id);
      setActivePlacemark(eventId);
    }

    setDetailsPanelState("opening");
    setSelectedEvent(event);
    setShowEventDetails(true);

    setTimeout(() => {
      setDetailsPanelState("open");
    }, 50);

    if (mapRef.current && event.latitude && event.longitude) {
      const eventCoords = normalizeCoordinates(event.longitude, event.latitude);
      mapRef.current.setCenter(eventCoords, ZOOM);
    }
  };

  const closeEventDetails = () => {
    setDetailsPanelState("closing");
    setTimeout(() => {
      setShowEventDetails(false);
      setDetailsPanelState("closed");
      setActivePlacemark(null);
    }, 300);
  };

  const centerOnUserLocation = () => {
    if (mapRef.current && userCoords) {
      mapRef.current.setCenter(userCoords, userLocationZoom);
    }
  };

  const getDetailsPanelClasses = () => {
    const baseClasses = `absolute bottom-0 left-0 right-0 shadow-lg rounded-t-xl max-h-[80%] overflow-y-auto transition-all duration-300 ease-in-out`;

    switch (detailsPanelState) {
      case "opening":
      case "closing":
        return `${baseClasses} transform translate-y-full opacity-0`;
      case "open":
        return `${baseClasses} transform translate-y-0 opacity-100`;
      default:
        return `${baseClasses} transform translate-y-full opacity-0`;
    }
  };

  return (
    <MapContainer size={containerSize}>
      <YandexMap
        instanceRef={mapRef}
        defaultState={{
          center: currentEvent ?? FALLBACK_CENTER,
          zoom: ZOOM,
          type: "yandex#map",
        }}
        onClick={handleClickMap}
        options={{
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
        }}
        width="100%"
        height="100%"
      >
        {userCoords && (
          <Placemark
            geometry={userCoords}
            properties={{
              hintContent: "Your location",
              balloonContent: "You are here",
            }}
            options={{
              preset: "islands#blueCircleDotIcon",
              iconColor: "#4F46E5",
              zIndex: 1000,
            }}
          />
        )}

        {isEvent
          ? currentEvent && (
              <Placemark
                geometry={currentEvent}
                properties={{
                  hintContent: "Event location",
                  balloonContent: "This event",
                }}
                options={{
                  iconLayout: "default#image",
                  iconImageHref: "/assets/img/map/placemaker.png",
                  iconImageSize: [40, 40],
                  iconImageOffset: [-20, -40],
                  cursor: "default",
                }}
              />
            )
          : events.map((event) => {
              if (!event.latitude || !event.longitude) return null;
              const coords = normalizeCoordinates(
                event.longitude,
                event.latitude,
              );
              const eventId = Number(event.id);
              const isActive =
                event.id !== undefined && activePlacemark === eventId;

              return (
                <Placemark
                  key={event.id}
                  geometry={coords}
                  onClick={() => handleEventClick(event)}
                  properties={{
                    iconContent: isActive
                      ? `<div class="pulse-animation">${event.name}</div>`
                      : event.name,
                    hintContent: event.name,
                  }}
                  options={{
                    iconLayout: "default#image",
                    iconImageHref: "/assets/img/map/placemaker.png",
                    iconImageSize: isActive ? [50, 50] : [30, 30],
                    iconImageOffset: isActive ? [-20, -50] : [-16, -42],
                    cursor: "pointer",
                  }}
                />
              );
            })}
      </YandexMap>

      {/* Animations */}
      <style jsx global>{`
        @keyframes pulseMarker {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {!isEvent && (
        <div className="absolute bottom-24 right-4">
          <button
            onClick={centerOnUserLocation}
            className="bg-white text-primary-purple rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110"
            aria-label="Center on my location"
            disabled={isUserLocationLoading || !userCoords}
          >
            <LocateFixed />
          </button>
        </div>
      )}

      {!isEvent && showEventDetails && selectedEvent && (
        <div className={getDetailsPanelClasses()}>
          <div className="flex p-4 justify-center">
            <EventCard event={selectedEvent} />
          </div>
        </div>
      )}
    </MapContainer>
  );
}
