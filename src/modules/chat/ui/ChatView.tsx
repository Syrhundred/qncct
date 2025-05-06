// src/modules/chat/ui/ChatView.tsx
"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/shared/lib/socket";
import { flushRoom } from "../model/chatSlice"; // <— typingAction больше не нужен
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetHistoryQuery } from "../api/chatApiSlice";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatView() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch();
  const messages = useSelector((s: RootState) => s.chat.messages[roomId] ?? []);
  const isTyping = useSelector(
    (s: RootState) => s.chat.typing[roomId] ?? false,
  );

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // REST history (загружаем при открытии комнаты)
  useGetHistoryQuery({ roomId });

  /** ───────── mark-as-read ───────── */
  useEffect(() => {
    if (!messages.length) return;
    socket.send({
      type: "read",
      room_id: roomId,
      last_msg_id: messages[messages.length - 1].id,
    });
    dispatch(flushRoom({ roomId }));
  }, [messages.length, roomId, dispatch]); // ← добавили зависимости

  /** ───────── авто-скролл ───────── */
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ───────── typing debounce ───────── */
  useEffect(() => {
    if (!input) return;
    socket.send({ type: "typing", room_id: roomId, state: true });
    const tid = setTimeout(
      () => socket.send({ type: "typing", room_id: roomId, state: false }),
      800,
    );
    return () => clearTimeout(tid);
  }, [input, roomId]);

  const send = () => {
    if (!input.trim()) return;
    socket.send({ type: "send", room_id: roomId, content: input });
    setInput("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <div className="flex items-center p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 rounded-full border px-4 py-2"
        />
        <button
          onClick={send}
          className="ml-2 rounded-full bg-indigo-600 p-2 text-white"
        >
          {/* иконка самолётика */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9l20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
