import { NextResponse, NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/success",
  "/complete-registration",
  "/verify",
  "/reset",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);

  const accessToken = request.cookies.get("access_token")?.value;
  const isActive = request.cookies.get("is_active")?.value; // "true" | "false" | undefined

  // 1. Нет токена => пускаем только на public-страницы
  if (!accessToken) {
    if (!isPublic) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Пользователь НЕ активирован
  if (isActive === "false") {
    if (pathname !== "/complete-registration") {
      const completeUrl = new URL("/complete-registration", request.url);
      return NextResponse.redirect(completeUrl);
    }
    return NextResponse.next();
  }

  // 3. Пользователь активен, но лезет на /complete-registration
  if (isActive === "true" && pathname === "/complete-registration") {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // 4. Всё ок
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|.*\\..*).*)"], // фильтруем статику и API
};
