"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const interestsList = [
  { icon: "🎤", title: "Music" },
  { icon: "🎨", title: "Design" },
  { icon: "🎭", title: "Theatre" },
  { icon: "🎮", title: "Gaming" },
];

export default function InterestsSelect({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleSelect = (interest: string) => {
    if (selected.includes(interest)) {
      setSelected(selected.filter((i) => i !== interest));
    } else {
      setSelected([...selected, interest]);
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
          {interestsList.map((interest) => (
            <label
              key={interest.title}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(interest.title)}
                onChange={() => toggleSelect(interest.title)}
                className="form-checkbox h-5 w-5 text-[#6A0DAD] rounded-md border-gray-300 focus:ring-0"
              />
              <span className="flex items-center gap-2 text-black">
                <span className="text-xl">{interest.icon}</span>
                <span className="text-base">{interest.title}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
