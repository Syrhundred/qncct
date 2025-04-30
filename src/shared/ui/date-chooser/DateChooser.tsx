"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import { format } from "date-fns";
import dayjs from "dayjs";

export default function DateChooser({
  selectedDate,
  onSelectDate,
  className,
}: {
  selectedDate?: string;
  onSelectDate?: (dateString: string) => void;
  className?: string;
}) {
  const [date, setDate] = useState<string>(selectedDate || "");
  const [showCalendar, setShowCalendar] = useState(false);

  const handleSelectDate: DatePickerProps["onChange"] = (value) => {
    if (!value) {
      setDate("");
      onSelectDate?.("");
      return;
    }

    const isoString = value.toDate().toISOString();
    setDate(isoString);
    onSelectDate?.(isoString);
    setShowCalendar(false);
  };

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="flex items-center justify-between w-full px-4 py-3 border rounded-xl cursor-pointer hover:border-indigo-500 transition-colors bg-white"
        onClick={toggleCalendar}
      >
        <div className="flex items-center gap-3">
          <CalendarIcon size={20} className="text-indigo-600" />
          <span className="text-gray-500 text-sm">
            {date ? format(new Date(date), "PPP") : "Choose from calendar"}
          </span>
        </div>
      </div>

      {showCalendar && (
        <div className="absolute z-50 mt-2">
          <DatePicker
            open
            onChange={handleSelectDate}
            defaultValue={date ? dayjs(date) : undefined}
            getPopupContainer={(trigger) => trigger.parentElement!}
            onOpenChange={(open) => !open && setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}
