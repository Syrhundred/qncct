async function fetchWithToken(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem("access_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as any),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Если access token просрочен, пытаемся обновить его с refresh token
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refresh_token");
    const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("access_token", data.access_token);
      // Повторяем исходный запрос с новым access token
      return fetchWithToken(url, options);
    }
  }
  return res;
}
