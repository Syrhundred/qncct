import { RoomDTO } from "../api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

export default function ChatRoomItem({ room }: { room: RoomDTO }) {
  const { room_id, banner, title, unread, last_msg_preview } = room;

  /* безопасный src */
  const avatar = banner || "/assets/img/profile/default.png";

  const time = last_msg_preview?.created_at
    ? dayjs(last_msg_preview.created_at).fromNow(true)
    : "";

  const preview = last_msg_preview?.content ?? "No messages yet";

  return (
    <Link
      href={`/chat/${room_id}`}
      className="flex items-center justify-between py-3"
    >
      <div className="flex items-start space-x-3">
        <Image
          src={avatar}
          alt={title}
          width={48}
          height={48}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <p className="font-medium">{title}</p>
          <p className="max-w-[200px] truncate text-sm text-gray-500">
            {preview}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end space-y-1">
        {time && <span className="text-xs text-gray-400">{time}</span>}
        {unread > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient px-1 text-xs text-white">
            {unread}
          </span>
        )}
      </div>
    </Link>
  );
}
