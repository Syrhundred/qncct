import { ReactNode } from "react";
import { Providers } from "@/store/Providers";

export default function ChatRoomLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
