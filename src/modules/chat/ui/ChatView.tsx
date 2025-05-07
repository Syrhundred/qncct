"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messageListRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

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
      console.debug(
        "[chat] History loaded for room",
        roomId,
        "messages:",
        data.length,
      );
      dispatch(historyLoaded({ roomId, msgs: data }));
    }
  }, [isSuccess, data, roomId, dispatch]);

  /* если вкладка стала видима → forceRefetch */
  useEffect(() => {
    if (pageVisible) {
      console.debug("[chat] Tab visible - refreshing history");
      refetch();
    }
  }, [pageVisible, refetch]);

  /* Handle scroll position tracking */
  useEffect(() => {
    const handleScroll = () => {
      if (!messageListRef.current) return;

      const { scrollHeight, scrollTop, clientHeight } = messageListRef.current;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Consider at bottom if within 30px of bottom
      setIsAtBottom(scrollBottom < 30);
    };

    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
      return () => messageList.removeEventListener("scroll", handleScroll);
    }
  }, []);

  /* -------- WebSocket listener -------- */
  useEffect(() => {
    if (!roomId) return;

    const handler = (e: MessageEvent) => {
      try {
        const d = JSON.parse(e.data);

        // Only process messages for current room
        if (d.room_id !== roomId) return;

        if (d.type === "message") {
          console.debug(
            "[chat] Message received in room handler",
            d.payload.id,
          );
          // Direct dispatch for immediate update
          dispatch(incomingMessage({ roomId, msg: d.payload }));
        }
        if (d.type === "typing") {
          dispatch(typing({ roomId, username: d.username, state: d.state }));
        }
      } catch (err) {
        console.error("[chat] Error handling WebSocket message", err);
      }
    };

    // Add component-specific WebSocket handler
    socket.addListener(handler);

    // Cleanup handler when component unmounts or roomId changes
    return () => {
      socket.removeListener(handler);
    };
  }, [roomId, dispatch]);

  /* mark as read */
  useEffect(() => {
    if (!roomId || !messages.length) return;

    // Get the last message ID
    const lastMsgId = messages[messages.length - 1].id;

    // Don't mark temporary messages as read
    if (lastMsgId.startsWith("tmp-")) return;

    console.debug("[chat] Marking messages as read up to", lastMsgId);

    socket.send({
      type: "read",
      room_id: roomId,
      last_msg_id: lastMsgId,
    });

    dispatch(flushRoom({ roomId }));
  }, [messages, roomId, dispatch]);

  /* Scroll to bottom when messages change, if already at bottom */
  useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (messages.length > 0 && messages[messages.length - 1].is_mine) {
      // Always scroll to view our own messages
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const [input, setInput] = useState("");

  // Handle typing indicators
  useEffect(() => {
    // Clear previous typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!roomId || !input) {
      // If input is empty, send stop typing event
      if (socket.connected) {
        socket.send({ type: "typing", room_id: roomId, state: false });
      }
      return;
    }

    // Send typing event
    if (socket.connected) {
      socket.send({ type: "typing", room_id: roomId, state: true });
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket.connected) {
        socket.send({ type: "typing", room_id: roomId, state: false });
      }
    }, 3000); // Longer timeout for better UX

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [input, roomId]);

  const send = useCallback(() => {
    if (!roomId || !input.trim()) return;

    const trimmedInput = input.trim();

    // Create optimistic message
    const optimistic: MessageDTO = {
      id: `tmp-${uuid()}`,
      room_id: roomId,
      sender: {
        id: user.id,
        username: user.profile.username,
        avatar_url: user.profile.avatar_url,
      },
      content: trimmedInput,
      created_at: new Date().toISOString(),
      is_mine: true,
      reply_to: null,
    };

    // Add to local state immediately
    console.debug("[chat] Adding optimistic message", optimistic.id);
    dispatch(incomingMessage({ roomId, msg: optimistic }));

    // Send to server with priority
    const sendResult = socket.send({
      type: "send",
      room_id: roomId,
      content: trimmedInput,
      priority: "high",
    });

    if (!sendResult) {
      console.warn("[chat] Failed to send message - socket not connected");
      // Consider showing an error toast/notification here
    }

    // Clear input
    setInput("");

    // Clear typing indicator
    socket.send({ type: "typing", room_id: roomId, state: false });

    // Ensure scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [roomId, input, user, dispatch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
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

      <div
        ref={messageListRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 pb-32"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400">
            <p>Нет сообщений. Начните общение!</p>
          </div>
        )}

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
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto mb-4 flex max-w-lg items-center gap-2 px-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите сообщение..."
          className="flex-1 rounded-full border px-4 py-2"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className={`rounded-full p-2 text-white ${
            input.trim() ? "bg-gradient" : "bg-gray-300"
          }`}
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
