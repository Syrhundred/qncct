"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DEFAULT_AVATAR = "/assets/img/profile/default.png";

export default function ChatHeader({
  banner,
  title,
}: {
  banner: string | null | undefined;
  title: string;
}) {
  const router = useRouter();
  const avatarSrc = banner || DEFAULT_AVATAR;

  return (
    <div className="flex items-center gap-3 bg-gradient px-4 py-3 text-white fixed w-full">
      <button onClick={() => router.back()}>
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M15 18 9 12 15 6" strokeWidth="2" fill="none" />
        </svg>
      </button>

      <Image
        src={avatarSrc}
        alt={title}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
      <div className="flex flex-col">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-[11px] opacity-80">Active now</span>
      </div>
    </div>
  );
}
