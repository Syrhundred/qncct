"use client";

import { destroyCookie } from "nookies";

export const fetchWithAuth = async (input: RequestInfo, init?: RequestInit) => {
  try {
    const res = await fetch(input, {
      ...init,
      credentials: "include", // <<<<<<<<<< ОБЯЗАТЕЛЬНО
    });

    if (res.status === 401) {
      destroyCookie(null, "access_token");
      destroyCookie(null, "is_active");

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    return res;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
