"use client";

import { useParams, useRouter } from "next/navigation";
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
import { fetchEventById, setSelectedEvent } from "@/store/eventSlice";
import { getDistanceInKm } from "@/shared/utils/getDistanceInKm";
import Modal from "@/shared/ui/modal/Modal";
import Image from "next/image";
import { useJoinEvent } from "@/shared/hooks/useJoinEvent";
import { BottomSheet } from "@/shared/ui/modal/BottomSheet";
import { EventParticipantList } from "@/modules/templates/event/EventParticipantList";
import { IEvent } from "@/shared/types/types";
import EventCard from "@/shared/ui/event-card/EventCard";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Event() {
  const router = useRouter();
  const currentUserId = useAppSelector((state) => state.user.id);
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const dispatch = useDispatch<AppDispatch>();
  const event = useAppSelector((state) => state.event.selectedEvent);
  const [similarEvents, setSimilarEvents] = useState<IEvent[]>([]);
  const formattedDate = dayjs(event?.date).format("D MMMM");
  const formattedTime = dayjs(event?.date).format("HH:mm");
  const formattedAddress = event?.address?.split(", К")[0] || event?.address;
  const [isExpanded, setIsExpanded] = useState(false);
  const [distance, setDistance] = useState<string>("");
  const userCoords = useAppSelector((state) => state.userLocation.coords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isParticipantsSheetOpen, setIsParticipantsSheetOpen] = useState(false);

  const normalizeCoordinates = (
    lng: number | string,
    lat: number | string,
  ): [number, number] => [Number(lat), Number(lng)];

  const coords =
    event?.latitude && event?.longitude
      ? normalizeCoordinates(event.longitude, event.latitude)
      : undefined;

  const { handleJoin, handleUnjoin, isJoined, isOwner } = useJoinEvent(event);

  const onConfirm = async () => {
    await handleJoin();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (userCoords && coords) {
      const dist = getDistanceInKm([userCoords.lat, userCoords.lng], coords);
      setDistance(`${dist.toFixed(1)} km`);
    }
  }, [userCoords, coords]);

  useEffect(() => {
    if (id) dispatch(fetchEventById(id));
    return () => {
      dispatch(setSelectedEvent(null));
    };
  }, [id, dispatch]);

  useEffect(() => {
    const handleCloseSheet = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === "close-participants") {
        setIsParticipantsSheetOpen(false);
      }
    };
    window.addEventListener("bottomsheet:close", handleCloseSheet);
    return () =>
      window.removeEventListener("bottomsheet:close", handleCloseSheet);
  }, []);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!event?.category?.name) return;
      const res = await fetch(
        `${baseUrl}/api/v1/events/filter?interests=${event.category.name}`,
      );
      const data = await res.json();
      const filtered = data.filter((e: IEvent) => e.id !== event.id);
      setSimilarEvents(filtered);
    };

    fetchSimilar();
  }, [event]);

  if (!event) return <EventSkeleton />;

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-white">
      {/* Header */}
      <div className="relative w-full">
        <Image
          width={1000}
          height={1000}
          src={event.images[0]?.url || "/assets/img/event-card/img.png"}
          className="w-full h-72 object-cover"
          alt="banner"
        />
        <div className="absolute top-3 left-0 right-0 flex justify-between px-5">
          <Link
            href="/"
            className="bg-white/60 p-1 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft />
          </Link>
          <span className="bg-white/60 text-sm rounded-2xl flex items-center px-3 py-1 backdrop-blur-sm">
            {event.category?.name}
          </span>
          <span className="bg-white/60 text-sm rounded flex flex-col items-center justify-center p-1 leading-[10px] backdrop-blur-sm">
            {distance || "–"} <p className="text-[8px]">away</p>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] -mt-6 rounded-t-[20px] bg-white py-6 px-5">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">{event.name}</h2>

          {/* Info */}
          <div className="flex justify-between items-start text-xs text-secondary">
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-primary-purple" />
              {formattedAddress}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={14} className="text-primary-purple" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock4 size={14} className="text-primary-purple" />
              {formattedTime}
            </span>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-xs">
            <span>
              {event.participants_preview?.length || 0} Members are joined:
            </span>
            <div
              className="flex -space-x-2 cursor-pointer"
              onClick={() => setIsParticipantsSheetOpen(true)}
            >
              {(event.participants_preview ?? []).slice(0, 3).map((p) => (
                <Image
                  key={p.user_id}
                  src={p.avatar_url || "/assets/img/profile/default.png"}
                  alt={p.username}
                  width={24}
                  height={24}
                  className="rounded-full border-2 border-white w-6 h-6 object-cover"
                />
              ))}
            </div>
          </div>

          {/* Organizer */}
          <div className="flex justify-between items-center w-full">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() =>
                event.created_by?.id === currentUserId
                  ? router.push("/profile/me")
                  : router.push(`/profile/${event.created_by?.id}`)
              }
            >
              <Image
                src={
                  event.created_by?.profile?.avatar_url ||
                  "/assets/img/profile/default.png"
                }
                alt="organizer"
                width={40}
                height={40}
                className="rounded-full w-10 h-10 object-cover"
              />
              <div className="text-sm">
                <p className="font-medium">
                  {event.created_by?.profile?.username || "Unknown"}
                </p>
                <p className="text-xs text-gray-500">Event Organizer</p>
              </div>
            </div>
            <button>
              <MessageSquareText className="text-gray-500" />
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold">Description</label>
            <p className="text-xs opacity-70 whitespace-pre-line">
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

          {/* Map */}
          {coords && (
            <YandexMap
              currentEvent={coords}
              containerSize="h-[200px] rounded-xl overflow-hidden"
            />
          )}

          {/* Join / Unjoin / Created */}
          {isOwner ? (
            <div className="w-full text-center bg-gradient text-white font-semibold py-3 rounded-xl mt-4 shadow">
              You have created this event!
            </div>
          ) : isJoined ? (
            <button
              className="w-full border border-primary-purple rounded-xl text-primary-purple text-sm font-semibold p-3 hover:bg-gradient-to-r from-purple-400 to-blue-500 hover:text-white transition"
              onClick={handleUnjoin}
            >
              Unjoin
            </button>
          ) : (
            <Button
              onClick={() => setIsModalOpen(true)}
              buttonText="Join"
              buttonType="button"
              state={false}
            />
          )}

          {/* Confirm Modal */}
          {isModalOpen && (
            <Modal
              onConfirm={onConfirm}
              onClose={() => setIsModalOpen(false)}
              modalText="Are you sure you want to join this event?"
              modalTitle="Join Event"
            />
          )}
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="mt-8 w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Similar events</h3>
              <Link href="/events" className="text-primary-purple text-sm">
                See All
              </Link>
            </div>
            <div className="flex overflow-x-auto gap-4 scrollbar-hide">
              {similarEvents.map((ev) => (
                <div key={ev.id} className="min-w-[280px]">
                  <EventCard event={ev} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BottomSheet */}
      <BottomSheet
        isOpen={isParticipantsSheetOpen}
        onCloseAction="close-participants"
        title="Participants"
      >
        <EventParticipantList eventId={event.id} />
      </BottomSheet>
    </div>
  );
}
