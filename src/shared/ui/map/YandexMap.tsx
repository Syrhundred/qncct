// LazyYandexMap.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { YMaps } from "@pbe/react-yandex-maps";

const LazyMap = dynamic(() => import("./GeocodeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] flex items-center justify-center bg-gray-100 rounded-md animate-pulse">
      <span className="text-gray-400 text-sm">Loading map...</span>
    </div>
  ),
});

interface LazyYandexMapProps {
  containerSize: string;
  currentEvent?: [number, number];
}

export default function LazyYandexMap({
  containerSize,
  currentEvent,
}: LazyYandexMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  return (
    <YMaps query={{ apikey: apiKey }}>
      <Suspense>
        <LazyMap containerSize={containerSize} currentEvent={currentEvent} />
      </Suspense>
    </YMaps>
  );
}
