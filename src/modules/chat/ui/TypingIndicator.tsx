"use client";

import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store";

/* ──────────────────────────────────────────────────────────────── */
const EMPTY_OBJ: Record<string, boolean> = {}; // ← единый «пустой» объект
/* ──────────────────────────────────────────────────────────────── */

const makeSelectTyping = (roomId: string, me: string) =>
  createSelector(
    (s: RootState) => s.chat.typing[roomId] ?? EMPTY_OBJ, // ← тут
    (map) => Object.keys(map).filter((u) => u !== me),
  );

export default function TypingIndicator({ roomId }: { roomId: string }) {
  const me = useSelector((s: RootState) => s.user.profile.username);

  /* selector живёт столько же, сколько компонент */
  const list = useSelector(
    React.useMemo(() => makeSelectTyping(roomId, me), [roomId, me]),
  );

  if (!list.length) return null;

  const label =
    list.length === 1
      ? `${list[0]} печатает…`
      : `${list.slice(0, 2).join(", ")} печатают…`;

  return <p className="px-2 py-1 text-xs italic text-gray-400">{label}</p>;
}
