"use client";

import { motion } from "framer-motion";
import InterestsSelect from "@/widgets/header/InterestsSelect";
import { useState, useTransition } from "react";

// Define a serializable prop type
type FilterBottomSheetProps = {
  open: boolean;
  onCloseId: string; // Using an ID instead of a function
};

export default function FilterBottomSheet({
  open,
  onCloseId,
}: FilterBottomSheetProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Handle close action
  const handleClose = () => {
    startTransition(() => {
      // You can use a custom event or another approach to handle the close action
      document.dispatchEvent(
        new CustomEvent("closeBottomSheet", { detail: { id: onCloseId } }),
      );
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      {/* Background click to close */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-white rounded-t-2xl p-6"
      >
        <div className="h-1 w-10 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-4">Filter</h2>

        <InterestsSelect
          value={selectedInterests}
          onChange={setSelectedInterests}
        />

        {/* Buttons */}
        <div className="space-y-4 mt-6">
          <button
            className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg"
            onClick={handleClose}
            disabled={isPending}
          >
            Apply Filters
          </button>
          <button
            className="w-full py-2 text-gray-600"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
