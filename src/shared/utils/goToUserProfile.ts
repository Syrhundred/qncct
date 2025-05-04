"use client";

import { useRouter } from "next/navigation";

export const useGoToUserProfile = () => {
  const router = useRouter();
  return (userId: string) => {
    if (!userId) return;
    router.push(`/profile/${userId}`);
  };
};
