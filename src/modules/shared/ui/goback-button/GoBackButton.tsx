"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "@/modules/shared/utils/cn";

export default function GoBackButton({
  noBack,
  isMap,
}: {
  noBack?: boolean;
  isMap?: boolean;
}) {
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2 && !isMap) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      onClick={handleGoBack}
      className={cn(
        `hover:underline flex items-center`,
        noBack && "bg-white p-3 rounded-md border",
      )}
    >
      <ChevronLeftIcon />
      {!noBack && "Back"}
    </div>
  );
}
