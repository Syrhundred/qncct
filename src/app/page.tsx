"use client";

import { useInitUserLocation } from "@/shared/hooks/useInitUserLocation";
import Recommendations from "@/widgets/home/recommendations/Recommendations";
import LayoutWithNavigation from "@/app/LayoutWithNavigation";
import Header from "@/widgets/header/Header";

export default function Home() {
  useInitUserLocation();

  return (
    <>
      <LayoutWithNavigation>
        <Header />
        <Recommendations />
      </LayoutWithNavigation>
    </>
  );
}
