// src/modules/chat/ui/MessageBubble.tsx
import { Message } from "../api/types";
export default function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div className="rounded-xl bg-indigo-600 text-white p-3 max-w-[70%] self-end">
      {msg.content}
    </div>
  );
}
