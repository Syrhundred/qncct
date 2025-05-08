"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, MapPin, Calendar } from "lucide-react";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import { IEvent } from "@/shared/types/types";
import Link from "next/link";

const EventTile = ({ event, index }: { event: IEvent; index: number }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      className="relative overflow-hidden rounded-2xl shadow-lg bg-white border border-gray-100"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-pink-100/20 to-blue-100/20"
        animate={{
          opacity: isActive ? 1 : 0.3,
        }}
      />

      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={event.images?.[0]?.url || "/default-event.jpg"}
          alt={event.name}
          className="w-full h-full object-cover"
          animate={{
            scale: isActive ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-4 relative z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {event.name}
        </h3>

        <div className="flex flex-col gap-2 mt-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-red-500" />
            <span className="line-clamp-1">{event.address}</span>
          </div>
        </div>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mt-4 pt-3 border-t border-gray-200/50"
            >
              <Link
                href={`/event/${event.id}`}
                className="w-full block text-center bg-blue-500 text-white py-2 px-4 rounded-lg font-medium active:scale-95 transition-transform"
              >
                Join Event
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute inset-0"
        onTapStart={() => setIsActive(!isActive)}
        onPanStart={() => setIsActive(false)}
      />
    </motion.div>
  );
};

export default function BoredEventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        if (!lat || !lon) throw new Error("Missing location parameters");

        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/nearby?lat=${lat}&lon=${lon}&radius=5000`,
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const eventsData = data.events || data.items || data;
        if (!Array.isArray(eventsData))
          throw new Error("Invalid events data format");

        setEvents(eventsData.slice(0, 5));
      } catch (error) {
        console.error("Failed to load events", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [lat, lon]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Loader2 className="h-12 w-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <div className="text-gray-700 text-lg mb-6">{error}</div>
          <motion.button
            onClick={() => router.back()}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium w-full"
          >
            <ArrowLeft className="inline mr-2" />
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        <motion.button
          onClick={() => router.back()}
          whileTap={{ scale: 0.95 }}
          className="mb-6 flex items-center gap-2 text-blue-500 font-medium"
        >
          <ArrowLeft size={20} />
          <span className="text-base">Back</span>
        </motion.button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Nearby Events
          </h1>
          <p className="text-gray-600">Events happening near your location</p>
        </div>

        {events.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 gap-4">
            {events.map((event, i) => (
              <EventTile key={event.id} event={event} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-gray-800 mb-3">
              No events found
            </h2>
            <motion.button
              onClick={() => router.back()}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium"
            >
              Try Again
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
