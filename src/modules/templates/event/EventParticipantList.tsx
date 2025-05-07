"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SmallButton from "@/modules/shared/ui/button/SmallButton";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import { useRouter } from "next/navigation";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type Participant = {
  user_id: string;
  username: string;
  avatar_url: string;
  is_following: boolean;
};

export const EventParticipantList = ({ eventId }: { eventId: string }) => {
  const currentUserId = useAppSelector((state) => state.user.id);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingUserIds, setLoadingUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchParticipants = async () => {
    try {
      const res = await fetchWithAuth(
        `${baseUrl}/api/v1/events/${eventId}/participants`,
      );
      const data: Participant[] = await res.json();

      const sorted = [
        ...data.filter((u) => u.user_id === currentUserId),
        ...data.filter((u) => u.user_id !== currentUserId),
      ];
      setParticipants(sorted);
    } catch (e) {
      console.error("Failed to fetch participants", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, [eventId, currentUserId]);

  const handleFollowToggle = async (targetId: string, isUnfollow: boolean) => {
    setLoadingUserIds((prev) => [...prev, targetId]);

    try {
      const method = isUnfollow ? "DELETE" : "POST";
      const res = await fetchWithAuth(
        `${baseUrl}/api/v1/subscriptions/${targetId}/${isUnfollow ? "unfollow" : "follow"}`,
        { method },
      );

      if (!res.ok) throw new Error("Failed to toggle follow");

      setParticipants((prev) => {
        const updated = prev.map((user) =>
          user.user_id === targetId
            ? { ...user, is_following: !isUnfollow }
            : user,
        );

        // перемещаем currentUser наверх
        return [
          ...updated.filter((u) => u.user_id === currentUserId),
          ...updated.filter((u) => u.user_id !== currentUserId),
        ];
      });
    } catch (err) {
      console.error("Follow toggle error:", err);
    } finally {
      setLoadingUserIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {participants.map((p) => {
        const isSelf = p.user_id === currentUserId;
        const isLoading = loadingUserIds.includes(p.user_id);

        return (
          <div
            key={p.user_id}
            className="flex items-center justify-between px-1"
          >
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() =>
                isSelf
                  ? router.push("/profile/me")
                  : router.push(`/profile/${p.user_id}`)
              }
            >
              <Image
                src={p.avatar_url || "/assets/img/profile/default.png"}
                alt={p.username}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10"
              />
              <div className="text-sm font-medium">{p.username}</div>
            </div>

            {!isSelf && (
              <SmallButton
                buttonText={
                  isLoading ? "..." : p.is_following ? "Unfollow" : "Follow"
                }
                onClick={() => handleFollowToggle(p.user_id, p.is_following)}
                state={isLoading}
                size="w-[80px] h-[32px]"
                className={
                  p.is_following
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
