"use client";

import { motion } from "framer-motion";
import InterestsSelect from "@/widgets/header/InterestsSelect";
import { useState } from "react";

export default function FilterBottomSheet({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-end">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md bg-white rounded-t-2xl p-6"
      >
        <div className="h-1 w-10 bg-gray-300 rounded-full mx-auto mb-4" />
        <h2>Filter</h2>
        <InterestsSelect
          selected={selectedInterests}
          setSelected={setSelectedInterests}
        />
        {/* Example content */}
        <div className="space-y-4">
          <button className="w-full py-2 bg-gradient text-white rounded-lg">
            Apply Filters
          </button>
          <button className="w-full py-2 text-gray-600" onClick={onClose}>
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
