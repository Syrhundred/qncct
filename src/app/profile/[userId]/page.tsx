// src/app/profile/[userId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserProfilePage } from "@/modules/templates/profile/UserProfilePage";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function PublicUserProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const res = await fetchWithAuth(`${baseUrl}/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <UserProfilePage user={user} isLoading={loading} showFollowButton={true} />
  );
}
