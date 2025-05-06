// src/modules/chat/ui/ChatRoomItem.tsx
import { Room } from "../api/types";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/shared/hooks/useAppSelector";

export default function ChatRoomItem({ room }: { room: Room }) {
  const myTyping = useAppSelector((s) => s.chat.typing[room.id]);

  return (
    <Link
      href={`/chat/${room.id}`}
      className="flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <Image
          src={room.avatar_url || "/assets/profile/default.png"}
          alt={room.title}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{room.title}</p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {myTyping ? "Печатает..." : room.last_message_preview}
          </p>
        </div>
      </div>
      {room.unread > 0 && (
        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
          {room.unread}
        </span>
      )}
    </Link>
  );
}
