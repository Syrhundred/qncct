"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "@/shared/lib/cookies";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // проверка для серверной среды

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const isActiveParam = searchParams.get("is_active");
    const isActive = isActiveParam === "true";

    if (!accessToken || !refreshToken || isActiveParam === null) return;

    // Расчёт времени жизни токенов
    const jwt = JSON.parse(atob(accessToken.split(".")[1]));
    const accessMaxAge =
      Math.max(jwt.exp * 1000 - Date.now(), 0) / 1000 || 60 * 60 * 24 * 7;

    // 1. LocalStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("is_active", JSON.stringify(isActive));

    // 2. Cookies
    setCookie("access_token", accessToken, accessMaxAge);
    setCookie("refresh_token", refreshToken, accessMaxAge);
    setCookie("is_active", String(isActive), 60 * 60 * 24 * 7); // неделя

    // 3. Чистим URL
    window.history.replaceState({}, document.title, "/success");

    // 4. Роутинг
    if (isActive) {
      router.replace("/");
    } else {
      router.replace("/complete-registration");
    }
  }, [searchParams, router]);

  return <div>Authorising…</div>;
}
