"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "@/shared/lib/cookies";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Create a separate component that uses useSearchParams
function AuthHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const isActiveParam = searchParams.get("is_active");
    const isActive = isActiveParam === "true";

    if (!accessToken || !refreshToken || isActiveParam === null) return;

    let jwt;
    try {
      jwt = JSON.parse(atob(accessToken.split(".")[1]));
    } catch (e) {
      console.error("Invalid JWT:", e);
      return;
    }

    const accessMaxAge =
      Math.max(jwt.exp * 1000 - Date.now(), 0) / 1000 || 60 * 60 * 24 * 7;

    // 1. LocalStorage
    if (accessToken && refreshToken) {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("is_active", JSON.stringify(isActive));
    }

    setCookie("access_token", accessToken, accessMaxAge);
    setCookie("refresh_token", refreshToken, accessMaxAge);
    setCookie("is_active", String(isActive), 60 * 60 * 24 * 7);

    window.history.replaceState({}, document.title, "/success");

    if (isActive) {
      router.replace("/");
    } else {
      router.replace("/complete-registration");
    }
  }, [searchParams, router]);

  return <div>Processing authentication...</div>;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Authorising...</div>}>
      <AuthHandler />
    </Suspense>
  );
}
