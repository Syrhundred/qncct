"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { v4 as uuid } from "uuid";
import { useDispatch } from "react-redux";
import { RootState } from "@/store";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { useGetHistoryQuery } from "../api/chatApiSlice";
import {
  historyLoaded,
  incomingMessage,
  typing,
  removeTmpMessage,
} from "../model/chatSlice";
import { socket } from "@/shared/lib/socket";
import { MessageDTO } from "@/modules/chat/api/types";
import { Send } from "lucide-react";

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

const EMPTY: MessageDTO[] = [];

export default function ChatView() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch();
  const pageVisible = usePageVisible();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const socketHandlerRef = useRef<((e: MessageEvent) => void) | null>(null);

  const user = useAppSelector((s) => s.user);
  const room = useAppSelector((s) => s.chat.rooms[roomId]);
  const messages = useAppSelector(
    (s: RootState) => s.chat.messages[roomId] ?? EMPTY,
  );

  const {
    data = [],
    isSuccess,
    refetch,
  } = useGetHistoryQuery(roomId!, {
    skip: !roomId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (isSuccess && data.length) {
      dispatch(historyLoaded({ roomId, msgs: data }));
    }
  }, [isSuccess, data, roomId, dispatch]);

  useEffect(() => {
    if (pageVisible) refetch();
  }, [pageVisible, refetch]);

  const handleWebSocketMessage = useCallback(
    (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.room_id !== roomId) return;

        switch (data.type) {
          case "message":
            dispatch(
              incomingMessage({
                roomId,
                msg: {
                  ...data.payload,
                  is_mine: data.payload.sender.id === user.id,
                },
              }),
            );
            break;
          case "typing":
            dispatch(
              typing({
                roomId,
                username: data.username,
                state: data.state,
              }),
            );
            break;
        }
      } catch (err) {
        console.error("[chat] WS message error:", err);
      }
    },
    [dispatch, roomId, user.id],
  );

  useEffect(() => {
    if (!roomId) return;

    socketHandlerRef.current = handleWebSocketMessage;
    socket.addListener(handleWebSocketMessage);

    return () => {
      if (socketHandlerRef.current) {
        socket.removeListener(socketHandlerRef.current);
      }
    };
  }, [roomId, handleWebSocketMessage]);

  const [input, setInput] = useState("");

  const send = useCallback(() => {
    if (!roomId || !input.trim()) return;

    const tmpId = `tmp-${uuid()}`;
    const trimmedInput = input.trim();

    const optimisticMsg: MessageDTO = {
      id: tmpId,
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

    dispatch(incomingMessage({ roomId, msg: optimisticMsg }));

    const timer = setTimeout(() => {
      const exists = messages.some((m) => m.id === tmpId);
      if (exists) {
        dispatch(removeTmpMessage({ roomId, tmpId }));
      }
    }, 15000);

    try {
      const success = socket.send({
        type: "send",
        room_id: roomId,
        content: trimmedInput,
        priority: "high",
      });

      if (!success) {
        clearTimeout(timer);
        dispatch(removeTmpMessage({ roomId, tmpId }));
      }
    } catch (err) {
      console.log(err);
      clearTimeout(timer);
      dispatch(removeTmpMessage({ roomId, tmpId }));
    }

    setInput("");
  }, [roomId, input, user, dispatch, messages]);

  return (
    <div className="flex h-full flex-col bg-white">
      <ChatHeader banner={room?.banner} title={room?.title ?? "Chat"} />

      <div
        ref={messageListRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 pb-32"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}
        <TypingIndicator roomId={roomId} />
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto mb-4 flex max-w-lg items-center gap-2 px-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          className="flex-1 rounded-full border px-4 py-2"
        />
        <button
          onClick={send}
          className="rounded-full bg-blue-500 p-2 text-white"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
