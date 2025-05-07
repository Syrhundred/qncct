import { destroyCookie } from "nookies";

export const fetchWithAuth = async (
  input: RequestInfo,
  init: RequestInit = {},
) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = {
    ...(init.headers || {}),
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(input, {
      ...init,
      headers,
      credentials: "include",
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
