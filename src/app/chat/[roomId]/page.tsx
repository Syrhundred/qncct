// src/app/chat/page.tsx
import ChatRoomsList from "@/modules/chat/ui/ChatRoomsList";

export default function ChatRoomsPage() {
  return (
    <main className="h-full bg-white pb-28">
      {" "}
      {/* pb-28 ≈ высота navbar */}
      <h1 className="px-4 pt-6 text-2xl font-bold">Chats</h1>
      <ChatRoomsList />
    </main>
  );
}
