"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/lib/storeHooks";
import { fetchCurrentUser } from "@/store/userSlice";
import { UserProfilePage } from "@/modules/templates/profile/UserProfilePage";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!user.id) {
      dispatch(fetchCurrentUser());
    }
  }, [user.id, dispatch]);

  return (
    <UserProfilePage
      isLoading={user.loading}
      user={user}
      showFollowButton={false}
    />
  );
}
