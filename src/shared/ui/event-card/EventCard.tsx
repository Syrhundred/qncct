import { IEvent } from "@/shared/types/types";
import { CalendarDays, MapPin } from "lucide-react";
import dayjs from "dayjs";
import SmallButton from "@/modules/shared/ui/button/SmallButton";
import Link from "next/link";
import { getDistanceInKm } from "@/shared/utils/getDistanceInKm";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function EventCard({ event }: { event: IEvent }) {
  const formattedDate = dayjs(event.date).format("D MMMM YYYY");
  const formattedAddress = event.address.substring(
    0,
    event.address.indexOf(", К"),
  );

  const [distance, setDistance] = useState<string>("");
  const userCoords = useAppSelector((state) => state.userLocation.coords);
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

  useEffect(() => {
    if (userCoords && coords) {
      const dist = getDistanceInKm([userCoords.lat, userCoords.lng], coords);
      setDistance(`${dist.toFixed(1)} km`);
    }
  }, [userCoords, coords]);

  return (
    <Link
      href={`/event/${event.id}`}
      className="w-full md:max-w-[355px] h-[309px] bg-white rounded-[10px] shadow-sm"
    >
      <div className="w-full h-44 bg-gray-50 rounded-t-[10px] flex justify-center">
        {event.images[0]?.url ? (
          <Image
            height={1000}
            width={1000}
            src={event.images[0]?.url}
            className="w-full h-full object-cover rounded-t-[10px]"
            alt="banner"
          />
        ) : (
          <Image
            height={1000}
            width={1000}
            src="/assets/img/event-card/img.png"
            className="w-1/2 h-full object-cover rounded-t-[10px]"
            alt="default"
          />
        )}
        <div className="absolute overflow-hidden z-20 flex items-center justify-between md:justify-center px-10 md:px-0 md:gap-28 mt-3 w-full text-xs">
          <span className="bg-white bg-opacity-60 rounded flex items-center px-2 py-1 uppercase">
            {event.category?.name}
          </span>
          <span className="bg-white bg-opacity-60 rounded flex flex-col items-center p-1 leading-[10px]">
            {distance} <p className="text-[8px]">away</p>
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-3">
        <h3 className="font-semibold">{event.name}</h3>
        <div className="flex justify-between items-start text-xs">
          <span className="flex items-start gap-1">
            <MapPin size={14} className="shrink-0 text-primary-purple" />
            {formattedAddress}
          </span>
          <span className="flex items-start gap-1 h-8">
            <CalendarDays size={14} className="text-primary-purple" />
            {formattedDate}
          </span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-sm flex gap-2">
            <Image
              width={1000}
              height={1000}
              src={
                event.created_by?.profile?.avatar_url
                  ? event.created_by?.profile?.avatar_url
                  : "/assets/img/event-card/avatar.svg"
              }
              className="rounded-full w-5 h-5"
              alt="avatar"
            />
            {event.created_by?.profile?.username}
          </span>
          <SmallButton
            buttonText={"Join"}
            state={false}
            buttonType="button"
            size="px-11 py-2"
          />
        </div>
      </div>
    </Link>
  );
}
