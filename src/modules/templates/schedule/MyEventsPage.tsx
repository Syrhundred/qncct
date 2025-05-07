"use client";

import { useEffect, useState } from "react";
import { IEvent } from "@/shared/types/types";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import EventCard from "@/shared/ui/event-card/EventCard";
import EventCardSkeleton from "@/shared/ui/skeletons/EventCardSkeleton";
import { Container } from "@/modules/shared/ui/core/Container";

const FILTERS = {
  upcoming: "upcoming",
  past: "past",
};

export default function MyEventsPage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      setIsLoading(true);
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/my-events?filter=${filter}`,
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyEvents();
  }, [filter]);

  return (
    <main className="w-full mb-24 mt-4">
      <Container>
        <h2 className="text-xl font-semibold text-center mb-4">Calendar</h2>

        {/* Toggle Filter */}
        <div className="flex justify-center gap-4 mb-6">
          {Object.entries(FILTERS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setFilter(value as "upcoming" | "past")}
              className={`px-5 py-2 rounded-full text-sm font-medium ${
                filter === value
                  ? "bg-primary-purple text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>

        {/* Event List */}
        <div className="w-full flex flex-col md:flex-row flex-wrap items-center gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => <EventCardSkeleton key={i} />)
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : events.length ? (
            events.map((event) => (
              <div
                key={event.id}
                className="w-full md:max-w-[355px] bg-white rounded-xl shadow-sm p-2"
              >
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No {filter} events yet.</p>
          )}
        </div>
      </Container>
    </main>
  );
}
