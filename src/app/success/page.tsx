"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setCookie } from "@/shared/lib/cookies";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return; // Check for server-side

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const isActiveParam = searchParams.get("is_active");
    const isActive = isActiveParam === "true";

    if (!accessToken || !refreshToken || isActiveParam === null) return;

    // Decode JWT and calculate token expiry
    const jwt = JSON.parse(atob(accessToken.split(".")[1]));
    const accessMaxAge =
      Math.max(jwt.exp * 1000 - Date.now(), 0) / 1000 || 60 * 60 * 24 * 7;

    // 1. LocalStorage
    if (
      accessToken &&
      refreshToken &&
      accessToken.length > 0 &&
      refreshToken.length > 0
    ) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("is_active", JSON.stringify(isActive));
    }

    // 2. Cookies
    setCookie("access_token", accessToken, accessMaxAge);
    setCookie("refresh_token", refreshToken, accessMaxAge);
    setCookie("is_active", String(isActive), 60 * 60 * 24 * 7); // 1 week

    // 3. Clean the URL
    window.history.replaceState({}, document.title, "/success");

    // 4. Redirect based on isActive
    if (isActive) {
      router.replace("/");
    } else {
      router.replace("/complete-registration");
    }
  }, [searchParams, router]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>Authorising…</div>
    </Suspense>
  );
}
