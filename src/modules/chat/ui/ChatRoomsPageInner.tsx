"use client";
import ChatRoomsList from "./ChatRoomsList";
import { useEffect } from "react";
import { fetchCurrentUser } from "@/store/userSlice";
import { useAppDispatch } from "@/shared/lib/storeHooks";

export default function ChatRoomsPageInner() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <main className="h-full bg-white">
      <h2 className="p-3">Chats</h2>
      <div className="mt-4 overflow-y-auto px-4">
        <ChatRoomsList />
      </div>
    </main>
  );
}
