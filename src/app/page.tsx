"use client";
import Navbar from "@/widgets/navbar/Navbar";
import Header from "@/widgets/header/Header";
import { useInitUserLocation } from "@/shared/hooks/useInitUserLocation";

export default function Home() {
  useInitUserLocation();

  return (
    <div>
      <Header />
      <Navbar />
    </div>
  );
}
