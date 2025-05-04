"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";
import SmallButton from "@/modules/shared/ui/button/SmallButton";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

type User = {
  user_id: string;
  username: string;
  avatar_url: string;
  is_mutual: boolean;
};

type Props = {
  type: "followers" | "following";
  userId?: string; // если undefined — значит смотрим себя
};

export const UserSubscriptionList = ({ type, userId }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const endpoint = userId
      ? `${baseUrl}/api/v1/subscriptions/${userId}/${type}`
      : `${baseUrl}/api/v1/subscriptions/me/${type}`;

    fetchWithAuth(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [type, userId]);

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-4 pb-10">
      {users.map((u) => {
        const isUnfollow =
          type === "following" || (type === "followers" && u.is_mutual);

        return (
          <div
            key={u.user_id}
            className="flex items-center justify-between px-1"
          >
            {/* Переход на профиль */}
            <div
              className="flex gap-3 items-center cursor-pointer"
              onClick={() => router.push(`/profile/${u.user_id}`)}
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

            <SmallButton
              buttonText={isUnfollow ? "Unfollow" : "Follow"}
              size="w-[80px] h-[32px]"
              onClick={() => {
                console.log(
                  `${isUnfollow ? "Unfollow" : "Follow"} ${u.user_id}`,
                );
              }}
              className={
                isUnfollow
                  ? "bg-gray-200 text-gray-700"
                  : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
              }
            />
          </div>
        );
      })}
    </div>
  );
};
