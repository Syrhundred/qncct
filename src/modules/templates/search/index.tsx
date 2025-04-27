"use client";
import SearchBar from "@/widgets/header/searchbar/SearchBar";
import { Container } from "@/modules/shared/ui/core/Container";
import YandexMap from "@/shared/ui/map/YandexMap";
import InterestsFilter from "@/widgets/header/InterestsFilter";
import { useState } from "react";
export default function SearchMap() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  return (
    <div>
      <div className="w-full absolute z-50 flex flex-col items-center pt-6">
        <Container>
          <SearchBar />
          <InterestsFilter
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
          />
        </Container>
      </div>
      <YandexMap
        containerSize="h-screen"
        selectedInterests={selectedInterests}
      />
    </div>
  );
}
