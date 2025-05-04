"use client";

import LayoutWithNavigation from "@/app/LayoutWithNavigation";
import GoBackButton from "@/modules/shared/ui/goback-button/GoBackButton";
import { Container } from "@/modules/shared/ui/core/Container";
import Interest from "@/shared/ui/interest/Interest";
import Image from "next/image";
import { BottomSheet } from "@/shared/ui/modal/BottomSheet";
import { UserSubscriptionList } from "@/widgets/subscriptions/UserSubscriptionList";
import { Skeleton } from "@mui/material";
import React, { useRef, useState, useLayoutEffect } from "react";
import SmallButton from "@/modules/shared/ui/button/SmallButton";

type Props = {
  isLoading: boolean;
  user: {
    id: string;
    profile: {
      username: string;
      interests: string[];
      avatar_url: string;
      about_me: string;
    };
    followers_count: number;
    following_count: number;
    is_following: boolean;
    is_follower: boolean;
    is_mutual: boolean;
  } | null;
  showFollowButton?: boolean;
};

export const UserProfilePage = ({
  isLoading,
  user,
  showFollowButton = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"info" | "badges" | "rating">(
    "info",
  );
  const [underlineStyle, setUnderlineStyle] = useState({});
  const tabRefs = {
    info: useRef<HTMLButtonElement>(null),
    badges: useRef<HTMLButtonElement>(null),
    rating: useRef<HTMLButtonElement>(null),
  };

  useLayoutEffect(() => {
    const ref = tabRefs[activeTab];
    if (ref.current) {
      const { offsetLeft, offsetWidth } = ref.current;
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
        height: 4,
        backgroundColor: "#641BFE",
        borderRadius: 2,
      });
    }
  }, [activeTab]);

  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<"followers" | "following">(
    "followers",
  );

  const openSheet = (type: "followers" | "following") => {
    setSheetType(type);
    setBottomSheetOpen(true);
  };

  const renderTabContent = () => {
    if (activeTab === "info") {
      return (
        <>
          <div className="w-full flex flex-col items-start px-2">
            <h3 className="font-medium text-[16px] mb-1">About me</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {user?.profile.about_me ||
                `Hi, my name is ${user?.profile.username}`}
            </p>
          </div>
          <div className="self-start w-full mt-6 px-2">
            <h3 className="font-medium text-[16px] mb-3">Interests</h3>
            <div className="flex flex-wrap gap-3">
              {user?.profile.interests?.map((interest) => (
                <Interest key={interest} title={interest} />
              ))}
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "badges") {
      return (
        <div className="text-center text-gray-500 text-sm mt-6">
          No badges yet
        </div>
      );
    }

    return (
      <div className="text-center text-gray-500 text-sm mt-6">
        No rating data
      </div>
    );
  };

  return (
    <div className="h-screen bg-white">
      <LayoutWithNavigation>
        <Container>
          <div className="flex flex-col gap-6 items-center mb-24 relative">
            <div className="absolute top-8 self-start">
              <GoBackButton />
            </div>

            <h2 className="text-center my-7 font-semibold text-[18px]">
              Profile
            </h2>

            {isLoading || !user ? (
              <>
                <Skeleton variant="circular" width={96} height={96} />
                <Skeleton variant="text" width={120} height={32} />
                <Skeleton variant="rectangular" width="80%" height={20} />
                <Skeleton variant="rectangular" width="80%" height={100} />
              </>
            ) : (
              <>
                <Image
                  src={
                    user.profile.avatar_url || "/assets/img/profile/default.png"
                  }
                  alt="avatar"
                  className="w-24 h-24 rounded-full border"
                  width={100}
                  height={100}
                />
                <h2 className="font-medium text-[18px]">
                  {user.profile.username}
                </h2>

                <div className="flex gap-6 text-sm text-gray-600">
                  <div
                    onClick={() => openSheet("following")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <span className="font-medium text-lg text-black">
                      {user.following_count}
                    </span>
                    <span>Following</span>
                  </div>
                  <div className="w-px h-6 bg-gray-300" />
                  <div
                    onClick={() => openSheet("followers")}
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <span className="font-medium text-lg text-black">
                      {user.followers_count}
                    </span>
                    <span>Followers</span>
                  </div>
                </div>

                {showFollowButton && (
                  <SmallButton
                    buttonText={
                      user.is_mutual
                        ? "Mutual"
                        : user.is_following
                          ? "Unfollow"
                          : user.is_follower
                            ? "Follow back"
                            : "Follow"
                    }
                    size="w-[100px] h-[36px]"
                    onClick={() => {
                      console.log("TODO: Follow/unfollow logic");
                    }}
                  />
                )}

                <div className="flex w-full mt-8 border-b border-gray-200 justify-around relative">
                  {(["info", "badges", "rating"] as const).map((tab) => (
                    <button
                      key={tab}
                      ref={tabRefs[tab]}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-[16px] ${
                        activeTab === tab
                          ? "text-[#641BFE] font-semibold"
                          : "text-gray-600 font-medium"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                  <div
                    className="absolute bottom-0 transition-all duration-300"
                    style={underlineStyle}
                  />
                </div>

                <div className="w-full px-2 mt-6">{renderTabContent()}</div>
              </>
            )}
          </div>
        </Container>
      </LayoutWithNavigation>

      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title={sheetType === "followers" ? "Followers" : "Following"}
      >
        <UserSubscriptionList type={sheetType} userId={user?.id} />
      </BottomSheet>
    </div>
  );
};
