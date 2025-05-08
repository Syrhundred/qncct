import BoredEvents from "@/modules/templates/bored-events";
import { Suspense } from "react";

export default function BoredEventsPage() {
  return (
    <Suspense>
      <BoredEvents />
    </Suspense>
  );
}
