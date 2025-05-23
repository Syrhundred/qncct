import { ReactNode } from "react";
import { Providers } from "@/store/Providers";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
}
