export interface RoomDTO {
  room_id: string;
  title: string;
  banner: string;
  unread: number;
  last_msg_preview?: {
    content?: string;
    created_at?: string;
  } | null;
}

export interface MessageDTO {
  id: string;
  room_id: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
  content: string;
  created_at: string; // ISO
  is_mine: boolean;
  reply_to: {
    id: string;
    sender: { id: string; username: string; avatar_url: string };
    snippet: string;
  } | null;
}
