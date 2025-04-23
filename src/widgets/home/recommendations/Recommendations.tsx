import { Container } from "@/modules/shared/ui/core/Container";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { useEffect } from "react";
import { AppDispatch, RootState } from "@/store";
import { fetchEvents } from "@/store/eventSlice";
import { useDispatch, useSelector } from "react-redux";
import EventCard from "@/shared/ui/event-card/EventCard";
import EventCardSkeleton from "@/shared/ui/skeletons/EventCardSkeleton";

export default function Recommendations() {
  const events = useAppSelector((state) => state.event.events);
  const { isLoading, error } = useSelector((state: RootState) => state.event);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  return (
    <main className="w-full mb-24 mt-4">
      <Container>
        <h3 className="text-start mb-4">Recommendations for you</h3>
        <div className="w-full flex flex-col md:flex-row flex-wrap items-center gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => <EventCardSkeleton key={i} />)
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : events.length !== 0 ? (
            events.map((event) => <EventCard key={event.id} event={event} />)
          ) : (
            <p className="text-center text-gray-400">
              No events yet :( <br /> But you can add yours
            </p>
          )}
        </div>
      </Container>
    </main>
  );
}
