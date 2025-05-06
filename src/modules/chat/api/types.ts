// src/modules/chat/api/types.ts
export interface Room {
  id: string;
  title: string;
  avatar_url: string;
  unread: number;
  last_message_preview: string;
  updated_at: string;
}

export interface Message {
  id: string;
  author_id: string;
  author_avatar: string;
  content: string;
  created_at: string;
  reply_to_id: string | null;
  type: "text" | "voice";
}
