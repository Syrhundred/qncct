"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FC } from "react";
import { useAppSelector } from "@/shared/hooks/useAppSelector";

interface InterestsSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const emojiByCategory: Record<string, string> = {
  Music: "🎵",
  Sports: "🏀",
  Travel: "🌍",
  Cooking: "🍳",
  Films: "🎬",
  Art: "🎨",
  Reading: "📚",
  Photo: "📸",
  Gaming: "🎮",
  Tech: "💻",
  Nature: "🌿",
  Fashion: "👗",
  Health: "💪",
  Business: "💼",
};

const InterestsSelect: FC<InterestsSelectProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const { categories } = useAppSelector((state) => state.category);

  const toggleSelect = (interest: string) => {
    if (value.includes(interest)) {
      onChange(value.filter((i) => i !== interest));
    } else {
      onChange([...value, interest]);
    }
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-primary-purple text-white rounded-2xl px-4 py-3 flex justify-between items-center"
      >
        <span className="text-sm">Choose Interests</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-2xl p-4 shadow-lg space-y-3">
          {categories.map((interest) => (
            <label
              key={interest.name}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(interest.name)}
                onChange={() => toggleSelect(interest.name)}
                className="form-checkbox h-5 w-5 text-[#6A0DAD] rounded-md border-gray-300 focus:ring-0"
              />
              <span className="flex items-center gap-2 text-black">
                <span className="text-xl">
                  {emojiByCategory[interest.name] ?? "✨"}
                </span>
                <span className="text-base">{interest.name}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterestsSelect;
