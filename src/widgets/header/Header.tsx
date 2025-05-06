"use client";

import { Container } from "@/modules/shared/ui/core/Container";
import { MapPin } from "lucide-react";
import Image from "next/image";
import SearchBar from "@/widgets/header/searchbar/SearchBar";
import { useAppSelector } from "@/shared/lib/storeHooks";
import Link from "next/link";
import { useInitUserLocation } from "@/shared/hooks/useInitUserLocation";

export default function Header() {
  const { isAuth } = useAppSelector((state) => state.auth);
  const { city } = useAppSelector((state) => state.userLocation);

  useInitUserLocation(isAuth);

  return (
    <header>
      <Container>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center mt-3">
            <div className="flex flex-col">
              <p>Location</p>
              <span className="flex items-center gap-1 text-lightgray">
                <MapPin size={20} color="#25131A" />
                Kazakhstan{city ? `, ${city}` : ""}
              </span>
            </div>
            <button className="bg-lightgray p-3 rounded-lg bg-opacity-10">
              <Image
                alt="bell"
                src="/assets/img/header/notification.svg"
                height={20}
                width={20}
              />
            </button>
          </div>
          <Link href="/search">
            <SearchBar isMainPage={true} />
          </Link>
        </div>
      </Container>
    </header>
  );
}
