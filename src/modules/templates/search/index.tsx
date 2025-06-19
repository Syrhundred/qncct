"use client";

import SearchBar from "@/widgets/header/searchbar/SearchBar";
import { Container } from "@/modules/shared/ui/core/Container";
import YandexMap from "@/shared/ui/map/YandexMap";
import InterestsFilter from "@/widgets/header/InterestsFilter";
import { useState, useEffect } from "react";
import GoBackButton from "@/modules/shared/ui/goback-button/GoBackButton";
import FilterBottomSheet from "@/widgets/header/FilterBottomSheet";
import { useRouter } from "next/navigation";
import { fetchEvents } from "@/store/eventSlice";
import { useAppDispatch } from "@/shared/lib/storeHooks";

export default function SearchMap() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleInterestsChanged = (e: CustomEvent) => {
      setSelectedInterests(e.detail.interests);
    };

    const handleSheetClosed = () => {
      setIsFilterOpen(false);
    };

    // TypeScript requires type assertion for CustomEvent
    document.addEventListener(
      "filterInterestsChanged",
      handleInterestsChanged as EventListener,
    );

    document.addEventListener(
      "filterBottomSheetClosed",
      handleSheetClosed as EventListener,
    );

    return () => {
      document.removeEventListener(
        "filterInterestsChanged",
        handleInterestsChanged as EventListener,
      );
      document.removeEventListener(
        "filterBottomSheetClosed",
        handleSheetClosed as EventListener,
      );
    };
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/search?search=${encodeURIComponent(query)}`);
    dispatch(fetchEvents({ search: query }));
  };

  return (
    <div>
      <div className="w-full absolute z-50 flex flex-col items-center pt-6">
        <Container>
          <div className="w-full flex items-center gap-1">
            <GoBackButton isMap={true} noBack={true} />
            <SearchBar
              isMainPage={false}
              onOpenFilter={() => setIsFilterOpen(true)}
              onSearch={handleSearch}
            />
          </div>
          <InterestsFilter
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
          />
        </Container>
      </div>

      <YandexMap
        isEvent={false}
        containerSize="h-screen"
        selectedInterests={selectedInterests}
      />

      <FilterBottomSheet
        open={isFilterOpen}
        onCloseId="search-filters"
        initialInterests={selectedInterests}
      />
    </div>
  );
}
