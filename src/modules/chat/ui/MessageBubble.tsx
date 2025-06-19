"use client";

import { MessageDTO } from "../api/types";
import dayjs from "dayjs";
import clsx from "clsx";
import Image from "next/image";

export default function MessageBubble({ msg }: { msg: MessageDTO }) {
  const isTemporary = msg.id.startsWith("tmp-");
  const time = dayjs(msg.created_at).format("HH:mm");

  return (
    <div
      className={clsx(
        "flex items-end gap-2 mb-4",
        msg.is_mine ? "justify-end" : "justify-start",
      )}
    >
      {!msg.is_mine && (
        <div>
          <Image
            src={msg.sender.avatar_url || "/assets/img/profile/default.png"}
            alt={msg.sender.username}
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      )}

      <div
        className={clsx(
          "max-w-[70%] rounded-xl px-4 py-2",
          msg.is_mine
            ? "bg-gradient text-white"
            : "bg-gray-100 dark:bg-gray-200 ",
          isTemporary && "opacity-50",
        )}
      >
        <span
          className={clsx(
            "text-xs",
            msg.is_mine ? "text-blue-100" : "text-gray-500",
          )}
        >
          {msg.sender.username}
        </span>

        <p className="break-words text-sm">{msg.content}</p>
        <p
          className={clsx(
            "text-xs mt-1",
            msg.is_mine ? "text-blue-100" : "text-gray-500",
          )}
        >
          {isTemporary ? "Sending..." : time}
        </p>
      </div>
    </div>
  );
}
