"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import {
  CalendarDays,
  MapPin,
  Clock4,
  MessageSquareText,
  ChevronLeft,
} from "lucide-react";
import dayjs from "dayjs";
import YandexMap from "@/shared/ui/map/YandexMap";
import EventSkeleton from "@/shared/ui/skeletons/EventSkeleton";
import Button from "@/modules/shared/ui/button/Button";
import Link from "next/link";
import {
  fetchEventById,
  joinEvent,
  setSelectedEvent,
} from "@/store/eventSlice";
import { getDistanceInKm } from "@/shared/utils/getDistanceInKm";
import Modal from "@/shared/ui/modal/Modal";
import Image from "next/image";

export default function Event() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const dispatch = useDispatch<AppDispatch>();
  const event = useAppSelector((state) => state.event.selectedEvent);
  const formattedDate = dayjs(event?.date).format("D MMMM YYYY");
  const formattedTime = dayjs(event?.date).format("HH:mm");
  const formattedAddress = event?.address?.split(", К")[0] || event?.address;
  const [isExpanded, setIsExpanded] = useState(false);
  const [distance, setDistance] = useState<string>("");
  const userCoords = useAppSelector((state) => state.userLocation.coords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const user = useAppSelector((state) => state.user);

  const normalizeCoordinates = (
    lng: number | string,
    lat: number | string,
  ): [number, number] => {
    return [Number(lat), Number(lng)];
  };
  const coords =
    event?.latitude && event?.longitude
      ? normalizeCoordinates(event?.longitude, event?.latitude)
      : undefined;

  const handleJoinButton = () => {
    setIsModalOpen(true);
  };

  const handleUnjoinButton = () => {};

  const onConfirm = () => {
    dispatch(joinEvent(event?.id));
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (userCoords && coords) {
      const dist = getDistanceInKm([userCoords.lat, userCoords.lng], coords);
      setDistance(`${dist.toFixed(1)} km`);
    }
  }, [userCoords, coords]);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
    return () => {
      dispatch(setSelectedEvent(null));
    };
  }, [id, dispatch]);

  if (!event) return <EventSkeleton />;

  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      <div className="relative w-full">
        <Image
          width={1000}
          height={1000}
          src={event.images[0]?.url || "/assets/img/event-card/img.png"}
          className="w-full h-72 object-cover"
          alt="banner"
        />

        <div className="absolute top-3 left-0 right-0 flex justify-between px-5">
          <Link href="/" className="bg-white opacity-60 p-1 rounded-full">
            <ChevronLeft />
          </Link>
          <span className="bg-white opacity-60 text-sm rounded-2xl flex items-center px-3 py-1">
            {event.category?.name}
          </span>
          <span className="bg-white opacity-60 text-sm rounded flex flex-col items-center justify-center p-1 leading-[10px]">
            {distance || "–"} <p className="text-[8px]">away</p>
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="relative z-10 w-full -mt-6 rounded-t-[20px] bg-white py-6 px-3">
        <div className="flex flex-col gap-4">
          <h2>{event.name}</h2>

          <div className="flex justify-between items-start text-xs">
            <span className="flex items-start gap-1">
              <MapPin size={14} className="shrink-0 text-primary-purple" />
              {formattedAddress}
            </span>
            <span className="flex items-start gap-1 h-8">
              <CalendarDays size={14} className="text-primary-purple" />
              {formattedDate}
            </span>
            <span className="flex items-start gap-1 h-8">
              <Clock4 size={14} className="text-primary-purple" />
              {formattedTime}
            </span>
          </div>

          <YandexMap containerSize="h-[250px]" currentEvent={coords} />

          <div className="w-full flex justify-between items-center">
            <span className="text-sm flex gap-2">
              <Image
                width={1000}
                height={1000}
                src={
                  event.created_by?.profile?.avatar_url ||
                  "/assets/img/event-card/avatar.svg"
                }
                className="rounded-full w-5 h-5"
                alt="avatar"
              />
              <p>
                {event.created_by?.profile?.username}
                <br />
                <span className="text-xs">Event Organizer</span>
              </p>
            </span>
            <button>
              <MessageSquareText />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold">Description</label>
            <p className="text-xs opacity-60 text-secondary whitespace-pre-line transition-all duration-200">
              {isExpanded || event.description.length <= 150
                ? event.description
                : `${event.description.substring(0, 150)}...`}
            </p>

            {event.description.length > 150 && (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-primary-purple text-xs mt-1 underline"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>

          {event.created_by?.profile?.username === user?.profile?.username ? (
            <p>You have created this event!</p>
          ) : event.is_joined ? (
            <Button
              onClick={handleJoinButton}
              className="bg-none border text-primary-purple"
              buttonText="Unjoin"
              buttonType="button"
              state={false}
            />
          ) : (
            <Button
              onClick={handleJoinButton}
              buttonText="Join"
              buttonType="button"
              state={false}
            />
          )}

          {isModalOpen && (
            <Modal
              onConfirm={onConfirm}
              onClose={() => setIsModalOpen(false)}
              modalText={
                "Are you sure you want to join this event? Once confirmed, you'll receive all updates and notifications related to it."
              }
              modalTitle="Join Event"
            />
          )}
        </div>
      </div>
    </div>
  );
}
