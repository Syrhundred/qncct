"use client";

import { motion } from "framer-motion";
import { cn } from "@/modules/shared/utils/cn";

const interestEmojis: Record<string, string> = {
  music: "🎵",
  sports: "⚽",
  travel: "✈️",
  cooking: "🍳",
  films: "🎬",
  technology: "💻",
  art: "🎨",
  reading: "📚",
  photo: "📷",
  gaming: "🎮",
};

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Interest({
  title,
  isButton,
  active,
  onClick,
}: {
  title: string;
  isButton?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const emoji = interestEmojis[title.toLowerCase()] || "❓";
  const capitalizedTitle = capitalizeFirstLetter(title);

  const baseClasses = `px-4 text-sm py-2 bg-white rounded-lg drop-shadow-md transition-all duration-100 flex justify-center items-center gap-2 cursor-pointer select-none`;

  return isButton ? (
    <motion.button
      onClick={onClick}
      className={cn(baseClasses, active ? "bg-gradient text-white" : "")}
      animate={{
        scale: active ? 1.05 : 1,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <span>{emoji}</span> {capitalizedTitle}
    </motion.button>
  ) : (
    <div className={baseClasses}>
      <span>{emoji}</span> {capitalizedTitle}
    </div>
  );
}
