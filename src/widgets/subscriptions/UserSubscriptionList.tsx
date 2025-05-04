"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import SmallButton from "@/modules/shared/ui/button/SmallButton";
import { useAppSelector } from "@/shared/lib/storeHooks";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  user_id: string;
  username: string;
  avatar_url: string;
  is_mutual: boolean;
};

type Props = {
  type: "followers" | "following";
  userId?: string;
  onChangeCounts?: (diff: { followers?: number; following?: number }) => void;
};

export const UserSubscriptionList = ({
  type,
  userId,
  onChangeCounts,
}: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUserIds, setLoadingUserIds] = useState<string[]>([]);
  const router = useRouter();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const fetchUsers = async () => {
    const endpoint = userId
      ? `${baseUrl}/api/v1/subscriptions/${userId}/${type}`
      : `${baseUrl}/api/v1/subscriptions/me/${type}`;

    try {
      const res = await fetchWithAuth(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const data = await res.json();
      const mutuals = data.filter((u: User) => u.is_mutual);
      const others = data.filter((u: User) => !u.is_mutual);
      setUsers([...mutuals, ...others]);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [type, userId]);

  const handleFollowToggle = async (targetId: string, isUnfollow: boolean) => {
    setLoadingUserIds((prev) => [...prev, targetId]);

    try {
      const method = isUnfollow ? "DELETE" : "POST";
      const res = await fetchWithAuth(
        `${baseUrl}/api/v1/subscriptions/${targetId}/${isUnfollow ? "unfollow" : "follow"}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      if (!res.ok) throw new Error("Failed to update subscription");

      // 🔄 Обновить UI локально
      setUsers((prev) =>
        prev
          .map((user) =>
            user.user_id === targetId
              ? { ...user, is_mutual: !isUnfollow }
              : user,
          )
          .filter((user) =>
            type === "following" && isUnfollow
              ? user.user_id !== targetId
              : true,
          )
          .sort((a, b) => Number(!a.is_mutual) - Number(!b.is_mutual)),
      );

      // 🔁 Обновить счётчики в родителе
      if (onChangeCounts) {
        if (type === "followers") {
          onChangeCounts({ followers: isUnfollow ? -1 : 1 });
        } else {
          onChangeCounts({ following: isUnfollow ? -1 : 1 });
        }
      }
    } catch (err) {
      console.error("Error toggling subscription:", err);
    } finally {
      setLoadingUserIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {users.map((u) => {
        const isOwnUser = u.user_id === currentUserId;
        const isUnfollow =
          type === "following" || (type === "followers" && u.is_mutual);
        const isLoading = loadingUserIds.includes(u.user_id);

        return (
          <div
            key={u.user_id}
            className="flex items-center justify-between px-1"
          >
            <div
              className="flex gap-3 items-center cursor-pointer"
              onClick={() =>
                isOwnUser
                  ? router.push("/profile/me")
                  : router.push(`/profile/${u.user_id}`)
              }
            >
              <Image
                src={u.avatar_url || "/assets/img/profile/default.png"}
                alt={u.username}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="font-medium text-sm">{u.username}</div>
                <div className="text-xs text-gray-400">Rating</div>
              </div>
            </div>

            {!isOwnUser && (
              <SmallButton
                buttonText={
                  isLoading ? "..." : isUnfollow ? "Unfollow" : "Follow"
                }
                state={isLoading}
                size="w-[80px] h-[32px]"
                onClick={() => handleFollowToggle(u.user_id, isUnfollow)}
                className={
                  isUnfollow
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
