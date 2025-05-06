"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { v4 as uuid } from "uuid";

import { useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useAppSelector } from "@/shared/hooks/useAppSelector";

import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

import { useGetHistoryQuery } from "../api/chatApiSlice";
import {
  flushRoom,
  historyLoaded,
  incomingMessage,
  typing,
} from "../model/chatSlice";

import { socket } from "@/shared/lib/socket";
import { MessageDTO } from "@/modules/chat/api/types";

/* ───────── вспомогательный хук ───────── */
function usePageVisible() {
  const [visible, setVisible] = React.useState(
    typeof document === "undefined"
      ? true
      : document.visibilityState === "visible",
  );

  useEffect(() => {
    const cb = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", cb);
    return () => document.removeEventListener("visibilitychange", cb);
  }, []);

  return visible;
}

/* ───────── компонент ───────── */
const EMPTY: MessageDTO[] = [];

export default function ChatView() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch();
  const pageVisible = usePageVisible();

  /* -------- Redux-state -------- */
  const user = useAppSelector((s) => s.user);
  const room = useAppSelector((s) => s.chat.rooms[roomId]);
  const messages = useAppSelector(
    (s: RootState) => s.chat.messages[roomId] ?? EMPTY,
  );

  /* -------- REST-история -------- */
  const {
    data = [],
    isSuccess,
    refetch,
  } = useGetHistoryQuery(roomId!, {
    skip: !roomId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false, // сами дергаем ниже
  });

  /* сливаем REST-ответ со стором */
  useEffect(() => {
    if (isSuccess && data.length) {
      dispatch(historyLoaded({ roomId, msgs: data }));
    }
  }, [isSuccess, data, roomId, dispatch]);

  /* если вкладка стала видима → forceRefetch */
  useEffect(() => {
    if (pageVisible) refetch();
  }, [pageVisible, refetch]);

  /* -------- WebSocket listener -------- */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = JSON.parse(e.data);

      if (d.room_id !== roomId) return;

      if (d.type === "message") {
        dispatch(incomingMessage({ roomId, msg: d.payload }));
      }
      if (d.type === "typing") {
        dispatch(typing({ roomId, username: d.username, state: d.state }));
      }
    };

    socket.addListener(handler);
    return () => socket.removeListener(handler);
  }, [roomId, dispatch]);

  /* mark as read */
  useEffect(() => {
    if (!messages.length) return;
    socket.send({
      type: "read",
      room_id: roomId,
      last_msg_id: messages.at(-1)!.id,
    });
    dispatch(flushRoom({ roomId }));
  }, [messages.length, roomId, dispatch]);

  /* -------- UI helpers -------- */
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages],
  );

  const [input, setInput] = useState("");
  useEffect(() => {
    if (!input) return;
    socket.send({ type: "typing", room_id: roomId, state: true });
    const id = setTimeout(
      () => socket.send({ type: "typing", room_id: roomId, state: false }),
      800,
    );
    return () => clearTimeout(id);
  }, [input, roomId]);

  const send = () => {
    if (!input.trim()) return;

    const optimistic: MessageDTO = {
      id: `tmp-${uuid()}`,
      room_id: roomId,
      sender: {
        id: user.id,
        username: user.profile.username,
        avatar_url: user.profile.avatar_url,
      },
      content: input,
      created_at: new Date().toISOString(),
      is_mine: true,
      reply_to: null,
    };
    dispatch(incomingMessage({ roomId, msg: optimistic }));
    socket.send({ type: "send", room_id: roomId, content: input });
    setInput("");
  };

  /* -------- render -------- */
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-0 z-50">
        <ChatHeader
          banner={room?.banner || "/assets/img/profile/default.png"}
          title={room?.title ?? "Chat"}
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 pb-32">
        {messages.map((m, i) => {
          const showDate =
            i === 0 ||
            dayjs(messages[i - 1].created_at).format("YYYY-MM-DD") !==
              dayjs(m.created_at).format("YYYY-MM-DD");

          return (
            <div key={m.id}>
              {showDate && (
                <p className="mb-4 text-center text-xs text-gray-400">
                  {dayjs(m.created_at).format("D MMMM")}
                </p>
              )}
              <MessageBubble msg={m} />
            </div>
          );
        })}

        <TypingIndicator roomId={roomId} />
        <div ref={endRef} />
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto mb-4 flex max-w-lg items-center gap-2 px-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-full border px-4 py-2"
        />
        <button
          onClick={send}
          className="rounded-full bg-gradient p-2 text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9l20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
