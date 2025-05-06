"use client";
import ChatRoomsList from "./ChatRoomsList";

export default function ChatRoomsPageInner() {
  return (
    <main className="h-full bg-white pb-28">
      <h1 className="px-4 pt-6 text-2xl font-bold">Chats</h1>
      <div className="mt-4 max-h-[calc(100vh-250px)] overflow-y-auto px-4">
        <ChatRoomsList />
      </div>
    </main>
  );
}
