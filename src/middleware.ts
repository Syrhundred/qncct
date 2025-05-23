import { NextResponse, NextRequest } from "next/server";

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/success",
  "/complete-registration",
  "/verify",
  "/reset",
];

// Define static resource paths to exclude from middleware processing
const EXCLUDED_PATHS = ["/_next", "/static", "/api", "/assets", "/favicon.ico"];

/**
 * Middleware function to handle authentication and routing logic
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for excluded paths
  if (
    EXCLUDED_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the current path is public
  const isPublic = PUBLIC_PATHS.includes(pathname);

  // Get authentication tokens and user status from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const isActive = request.cookies.get("is_active")?.value;

  // CASE 1: No token - allow only public pages
  if (!accessToken) {
    if (!isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // CASE 2: User not activated - allow only /verify and /complete-registration
  if (isActive === "false") {
    if (!["/verify", "/complete-registration"].includes(pathname)) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
    return NextResponse.next();
  }

  // CASE 3: Active user trying to access registration completion page
  if (isActive === "true" && pathname === "/complete-registration") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // CASE 4: All good
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|public/|api/).*)"],
};
