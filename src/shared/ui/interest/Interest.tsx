"use client";

import { motion } from "framer-motion";
import { cn } from "@/modules/shared/utils/cn";

export const interestEmojis: Record<string, string> = {
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
  const emoji = interestEmojis[title] || "❓";

  const baseClasses = `px-4 text-sm py-2 bg-white rounded-xl border text-gray-800 shadow-sm transition-all duration-100 flex justify-center items-center gap-2 cursor-pointer select-none`;

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
      <span>{emoji}</span> {title}
    </motion.button>
  ) : (
    <div className={baseClasses}>
      <span>{emoji}</span> {title}
    </div>
  );
}
