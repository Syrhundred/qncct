// src/app/chat/layout.tsx
import { ReactNode } from "react";
import LayoutWithNavigation from "../LayoutWithNavigation"; // <= путь из root
import { Providers } from "@/store/Providers";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <LayoutWithNavigation>{children}</LayoutWithNavigation>
    </Providers>
  );
}
