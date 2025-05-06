import { MessageDTO } from "../api/types";
import Image from "next/image";
import clsx from "clsx";
import dayjs from "dayjs";

const DEFAULT_AVATAR = "/assets/img/profile/default.png";

export default function MessageBubble({ msg }: { msg: MessageDTO }) {
  const isMine = msg.is_mine;
  const avatarSrc = msg.sender.avatar_url || DEFAULT_AVATAR;

  return (
    <div
      className={clsx(
        "flex items-end",
        isMine ? "justify-end space-x-reverse" : "space-x-2",
      )}
    >
      {!isMine && (
        <Image
          src={avatarSrc}
          alt={msg.sender.username}
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
        />
      )}

      <div className="flex flex-col">
        <div
          className={clsx(
            "max-w-[70vw] rounded-2xl px-4 py-3 text-sm leading-snug shadow",
            isMine
              ? "bg-gradient text-white shadow-md"
              : "bg-gray-100 text-gray-800",
          )}
        >
          {msg.content}
        </div>
        <span
          className={clsx(
            "mt-1 text-[10px]",
            isMine ? "text-right pr-2 text-gray-300" : "pl-2 text-gray-400",
          )}
        >
          {dayjs(msg.created_at).format("HH:mm")}
        </span>
      </div>
    </div>
  );
}
