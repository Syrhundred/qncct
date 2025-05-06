"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
  isMainPage,
  onOpenFilter,
  onSearch,
}: {
  isMainPage: boolean;
  onOpenFilter?: () => void;
  onSearch?: (query: string) => void;
}) {
  const [search, setSearch] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      onSearch?.(search.trim());
    }
  };

  return (
    <div className="relative flex items-center">
      <div className="w-full">
        <input
          className="w-full px-12 p-3 rounded-lg border focus:outline-none placeholder-lightgray placeholder-opacity-20"
          name="search"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="absolute left-3 flex items-center">
        <Search className="text-lightgray opacity-20" />
      </div>
      {!isMainPage && (
        <button
          type="button"
          onClick={onOpenFilter}
          className="absolute right-3 flex items-center"
        >
          <SlidersHorizontal />
        </button>
      )}
    </div>
  );
}
