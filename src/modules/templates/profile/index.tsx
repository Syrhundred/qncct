"use client";

import LayoutWithNavigation from "@/app/LayoutWithNavigation";
import GoBackButton from "@/modules/shared/ui/goback-button/GoBackButton";
import { Container } from "@/modules/shared/ui/core/Container";
import Image from "next/image";
import { useEffect } from "react";
import { useAppDispatch } from "@/shared/lib/storeHooks";
import { fetchCurrentUser } from "@/store/userSlice";
import { useAppSelector } from "@/shared/hooks/useAppSelector";
import Interest from "@/shared/ui/interest/Interest";

export default function Profile() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  useEffect(() => {
    if (!user.id) {
      dispatch(fetchCurrentUser());
    }
  }, [user.id, dispatch]);

  return (
    <div className="h-screen bg-white">
      <LayoutWithNavigation>
        <Container>
          <div className="flex flex-col gap-6 items-center mb-20">
            <div className="absolute top-8 self-start">
              <GoBackButton />
            </div>
            <h2 className="text-center my-7">Profile</h2>
            <Image
              src={
                user.profile.avatar_url
                  ? user.profile.avatar_url
                  : "/assets/img/profile/default.png"
              }
              alt="avatar"
              className="w-24 h-24 rounded-full flex-shrink-0 border"
              width={1000}
              height={1000}
            />
            <h2>{user.profile.username}</h2>
            <div className="flex gap-3">
              <div className="flex flex-col items-center border-r border-b-gray-600 pr-3">
                {user.following_count}{" "}
                <span className="text-secondary">following</span>
              </div>
              <div className="flex flex-col items-center">
                {user.followers_count}{" "}
                <span className="text-secondary">followers</span>
              </div>
            </div>
            {/*<Button*/}
            {/*  buttonText="Follow"*/}
            {/*  buttonType={"button"}*/}
            {/*  className="w-32"*/}
            {/*/>*/}
            <div className="w-full flex flex-col items-start">
              <h3>About me</h3>
              <p className="text-gray-500 text-sm">
                {user.profile.about_me
                  ? user.profile.about_me
                  : "Hi, my name is " + user.profile.username}
              </p>
            </div>
            <div className="self-start">
              <h3>Interests</h3>
              <div className="mt-3 flex gap-2 flex-wrap">
                {user.profile.interests?.map((interest) => (
                  <Interest key={interest} title={interest} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </LayoutWithNavigation>
    </div>
  );
}
