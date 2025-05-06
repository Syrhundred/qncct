// «лёгкая» обёртка: ставит cookie, доступную middleware
export function setCookie(name: string, value: string, maxAgeSec: number) {
  document.cookie =
    `${name}=${encodeURIComponent(value)}; ` +
    `path=/; max-age=${Math.floor(maxAgeSec)}; samesite=lax; secure`;
}
export const getAccessToken = () =>
  typeof window === "undefined"
    ? ""
    : (localStorage.getItem("access_token") ?? "");
