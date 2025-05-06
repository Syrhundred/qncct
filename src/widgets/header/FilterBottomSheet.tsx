"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import InterestsSelect from "@/widgets/header/InterestsSelect";
import DateChooser from "@/shared/ui/date-chooser/DateChooser";
import LocationAutocompleteYandex from "@/shared/ui/map/LocationAutocompleteYandex";
import { useAppDispatch } from "@/shared/lib/storeHooks";
import { fetchEvents } from "@/store/eventSlice";

type YandexPlace = {
  name: string;
  description: string;
  fullAddress: string;
  coordinates: [number, number];
};

type FilterBottomSheetProps = {
  open: boolean;
  onCloseId: string;
  initialInterests: string[];
};

interface FetchEventsParams {
  date_filter?: "today" | "tomorrow" | "this_week";
  custom_date?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  interests?: string[];
  search?: string;
}

export default function FilterBottomSheet({
  open,
  onCloseId,
  initialInterests,
}: FilterBottomSheetProps) {
  const [selectedInterests, setSelectedInterests] =
    useState<string[]>(initialInterests);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateFilter, setDateFilter] = useState<
    "today" | "tomorrow" | "this_week" | null
  >(null);
  const [selectedLocation, setSelectedLocation] = useState<YandexPlace | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleClose = () => {
    startTransition(() => {
      document.dispatchEvent(
        new CustomEvent("closeBottomSheet", { detail: { id: onCloseId } }),
      );
      // Dispatch an event when closing for parent components to handle
      document.dispatchEvent(new CustomEvent("filterBottomSheetClosed"));
    });
  };

  const toLocalISODate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (dateFilter) {
      params.append("date_filter", dateFilter);
    } else if (selectedDate) {
      params.append("custom_date", toLocalISODate(selectedDate));
    }

    if (selectedLocation) {
      params.append("lat", selectedLocation.coordinates[1].toString());
      params.append("lon", selectedLocation.coordinates[0].toString());
      params.append("radius_km", "5");
    }

    if (selectedInterests.length > 0) {
      selectedInterests.forEach((interest) => {
        params.append("interests", interest);
      });
    }

    return params.toString();
  };

  const dispatch = useAppDispatch();

  const handleApplyFilters = () => {
    const query = buildQueryParams();
    router.push(`/search?${query}`);

    const fetchParams: FetchEventsParams = {};

    if (dateFilter) {
      fetchParams.date_filter = dateFilter;
    } else if (selectedDate) {
      fetchParams.custom_date = toLocalISODate(selectedDate);
    }

    if (selectedDate) fetchParams.custom_date = toLocalISODate(selectedDate);

    if (selectedLocation) {
      fetchParams.lat = selectedLocation.coordinates[1];
      fetchParams.lon = selectedLocation.coordinates[0];
      fetchParams.radius_km = 5;
    }

    if (selectedInterests.length > 0) {
      fetchParams.interests = selectedInterests;
    }

    dispatch(fetchEvents(fetchParams));

    // Dispatch an event with the updated interests for parent components to use
    document.dispatchEvent(
      new CustomEvent("filterInterestsChanged", {
        detail: { interests: selectedInterests },
      }),
    );

    handleClose();
  };

  const setToday = () => {
    setDateFilter("today");
    setSelectedDate(null); // Удаляем custom_date
  };

  const setTomorrow = () => {
    setDateFilter("tomorrow");
    setSelectedDate(null);
  };

  const setThisWeek = () => {
    setDateFilter("this_week");
    setSelectedDate(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full flex flex-col gap-4 max-w-md bg-white rounded-t-2xl p-6"
      >
        <div className="h-1 w-10 bg-gray-300 rounded-full mx-auto" />

        <div>
          <h2 className="text-lg font-semibold">Filter</h2>
          <InterestsSelect
            value={selectedInterests}
            onChange={setSelectedInterests}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Date</h2>
          <div className="flex items-center justify-between gap-2 text-gray-500">
            <button
              className={`flex-1 border px-3 py-2 rounded-[10px] text-sm hover:bg-gray-50 ${dateFilter === "today" ? "border-blue-500 text-blue-500" : ""}`}
              onClick={setToday}
            >
              Today
            </button>
            <button
              className={`flex-1 border px-3 py-2 rounded-[10px] text-sm hover:bg-gray-50 ${dateFilter === "tomorrow" ? "border-blue-500 text-blue-500" : ""}`}
              onClick={setTomorrow}
            >
              Tomorrow
            </button>
            <button
              className={`flex-1 border px-3 py-2 rounded-[10px] text-sm hover:bg-gray-50 ${dateFilter === "this_week" ? "border-blue-500 text-blue-500" : ""}`}
              onClick={setThisWeek}
            >
              This Week
            </button>
          </div>
        </div>

        <DateChooser
          selectedDate={selectedDate ? selectedDate.toISOString() : undefined}
          onSelectDate={(date) => {
            if (date) {
              setDateFilter(null); // Сброс фильтра
              setSelectedDate(new Date(date));
            }
          }}
        />

        <div>
          <span className="flex items-center gap-1">
            <h2 className="text-lg font-semibold">Location</h2>{" "}
            <span className="text-xs">(radius - 5km)</span>
          </span>
          <LocationAutocompleteYandex
            onSelect={(place) => setSelectedLocation(place)}
          />
        </div>

        <div className="flex text-sm gap-3">
          <button
            className="w-full py-2 border bg-gradient bg-clip-text text-transparent rounded-lg text-gray-500"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="w-full py-2 bg-gradient text-white rounded-lg"
            onClick={handleApplyFilters}
            disabled={isPending}
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </div>
  );
}
