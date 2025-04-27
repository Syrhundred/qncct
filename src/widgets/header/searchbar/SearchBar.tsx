"use client";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import FilterBottomSheet from "@/widgets/header/FilterBottomSheet";

export default function SearchBar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="relative flex items-center">
      <Link href={"/search"} className="w-full">
        <input
          className="w-full pl-12 p-3 rounded-lg focus:outline-none text-sm placeholder-lightgray placeholder-opacity-20"
          name="search"
          type="text"
          placeholder="Search"
        />
      </Link>
      <div className="absolute left-3 flex items-center">
        <Search className="text-lightgray opacity-20" />
      </div>
      <button
        type="button"
        onClick={() => setIsFilterOpen(true)}
        className="absolute right-3 flex items-center"
      >
        <SlidersHorizontal />
      </button>

      {isFilterOpen && (
        <FilterBottomSheet onClose={() => setIsFilterOpen(false)} />
      )}
    </div>
  );
}
