"use client";

import { useEffect, useState } from "react";
import { IEvent } from "@/shared/types/types";
import EventCard from "@/shared/ui/event-card/EventCard";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import { Container } from "@/modules/shared/ui/core/Container";

export default function TrendingEvents() {
  const [events, setEvents] = useState<IEvent[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/trending-events`,
        );
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load trending events", err);
      }
    };

    fetchTrending();
  }, []);

  if (!events.length) return null;

  return (
    <main className="w-full mt-4">
      <Container>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-start mb-4">Trending Events</h3>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {events.map((event) => (
            <div
              key={event.id}
              className="shrink-0 w-[280px] md:w-[355px] bg-white rounded-xl shadow-sm p-2"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
