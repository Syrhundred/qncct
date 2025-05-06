// src/modules/chat/ui/ChatRoomsList.tsx
"use client";
import { useGetRoomsQuery } from "../api/chatApiSlice";
import ChatRoomItem from "./ChatRoomItem";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { Room } from "../api/types";

export const ChatRoomsList = () => {
  // REST для первых данных (точка 3)
  useGetRoomsQuery(); // кешируем в RTK-Query
  const rooms = useAppSelector(
    (s) => Object.values(s.chat.rooms) as Room[],
  ).sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));

  return (
    <div className="flex flex-col space-y-4 px-4 pt-6">
      {rooms.map((r) => (
        <ChatRoomItem key={r.id} room={r} />
      ))}
    </div>
  );
};
export default ChatRoomsList;
