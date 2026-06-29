import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_ACCESS_SECRET environment variable is required");
}
const ACCESS_SECRET = new TextEncoder().encode(JWT_SECRET);

const RAW_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!RAW_APP_URL) {
  throw new Error("NEXT_PUBLIC_APP_URL environment variable is required");
}
let APP_URL: string;
try {
  APP_URL = new URL(RAW_APP_URL).origin;
} catch {
  throw new Error(
    `NEXT_PUBLIC_APP_URL is not a valid URL: ${RAW_APP_URL}`,
  );
}

const publicPaths = [
  "/",
  "/login",
  "/onboarding",
  "/activate",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/activate",
  "/api/auth/forgot-password",
  "/api/auth/verify-reset-code",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/webauthn/login/start",
  "/api/auth/webauthn/login/complete",
  "/api/tig/webhook",
  "/api/tig/verify-otp",
  "/api/tig/reset-password",
  "/api/diag/redis",
  "/api/diag/prisma",
  "/api/admin/bot-control/assistance-request",
];

const csrfExemptPaths = [
  "/api/auth/login",
  "/api/auth/activate",
  "/api/auth/forgot-password",
  "/api/auth/verify-reset-code",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/webauthn/login/start",
  "/api/auth/webauthn/login/complete",
  "/api/auth/webauthn/register/start",
  "/api/auth/webauthn/register/complete",
  "/api/auth/2fa/complete",
  "/api/auth/verify-session",
  "/api/realtime/authorize",
  "/api/tig/webhook",
  "/api/tig/verify-otp",
  "/api/tig/reset-password",
  "/api/diag/redis",
  "/api/push/subscribe",
  "/api/push/unsubscribe",
  "/api/user/ping",
  "/api/admin/bot-control/assistance-request",
];

const adminPaths = ["/admin"];
const managementPaths = ["/management"];
const teacherPaths = ["/teacher"];
const studentPaths = ["/student"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) =>
      pathname === p ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/tig/webhook") ||
      pathname.startsWith("/api/tig/verify-otp") ||
      pathname.startsWith("/api/tig/reset-password") ||
      pathname.startsWith("/api/diag/redis") ||
      pathname.startsWith("/api/diag/prisma"),
  );
}

function clearCookiesAndRedirect() {
  const redirectRes = NextResponse.redirect(new URL("/login", APP_URL));
  redirectRes.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  redirectRes.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return redirectRes;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path for source map requests (prevents 404 noise)
  if (pathname.endsWith(".map")) {
    return new NextResponse(null, { status: 204 });
  }

  // Fast path for other static assets (no auth needed)
  if (pathname.startsWith("/_next/static/")) {
    return NextResponse.next();
  }

  if (pathname.endsWith("com.chrome.devtools.json")) {
    return new NextResponse(null, { status: 204 });
  }

  const response = NextResponse.next();

  // Correlation ID للتتبع
  const correlationBytes = new Uint8Array(16);
  crypto.getRandomValues(correlationBytes);
  const correlationId = Array.from(correlationBytes, (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  request.headers.set("x-correlation-id", correlationId);
  response.headers.set("x-correlation-id", correlationId);

  // أمان الرؤوس
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  const isDev = process.env.NODE_ENV === "development";
  response.headers.set(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://ik.imagekit.io; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ${APP_URL} https://*.upstash.io https://*.supabase.co wss://*.supabase.co; frame-src 'self' https://www.youtube.com; media-src 'self' data:;`,
  );

  const method = request.method;

  // تعيين CSRF token إذا لم يكن موجوداً
  if (!request.cookies.get("csrf-token")?.value) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    response.cookies.set("csrf-token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
      path: "/",
    });
  }

  // التحقق من CSRF لـ API requests (POST/PUT/DELETE)
  if (
    ["POST", "PUT", "DELETE", "PATCH"].includes(method) &&
    pathname.startsWith("/api/") &&
    !csrfExemptPaths.some((p) => pathname.startsWith(p))
  ) {
    const headerToken = request.headers.get("X-CSRF-Token");
    const cookieToken = request.cookies.get("csrf-token")?.value;
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return NextResponse.json(
        { success: false, message: "طلب غير مصرح (CSRF)" },
        { status: 403 },
      );
    }
  }

  // السماح للمسارات العامة بدون مصادقة
  if (isPublicPath(pathname)) {
    return response;
  }

  // التحقق من وجود accessToken
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // لا يوجد accessToken — توجيه إلى تسجيل الدخول مباشرة
    return NextResponse.redirect(new URL("/login", APP_URL));
  }

  // المسارات غير المحمية بالأدوار — فقط نتأكد من وجود token بدون فك تشفير JWT (أسرع)
  const protectedPaths = [...adminPaths, ...managementPaths, ...teacherPaths, ...studentPaths];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    return response;
  }

  // التحقق من صحة JWT (يتم محلياً — لا حاجة لـ self-fetch)
  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);

    const userRole = payload.managementLevel ? "MANAGEMENT" : (payload.role as string);

    // التحقق من صلاحية الدور للمسار المطلوب
    const isAdminPath = adminPaths.some((p) => pathname.startsWith(p));
    if (isAdminPath && userRole !== "ADMIN" && userRole !== "MANAGEMENT") {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    if (
      managementPaths.some((p) => pathname.startsWith(p)) &&
      userRole !== "MANAGEMENT" &&
      userRole !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    if (
      teacherPaths.some((p) => pathname.startsWith(p)) &&
      userRole !== "TEACHER" &&
      userRole !== "ADMIN" &&
      userRole !== "MANAGEMENT"
    ) {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    if (
      studentPaths.some((p) => pathname.startsWith(p)) &&
      userRole !== "STUDENT" &&
      userRole !== "ADMIN" &&
      userRole !== "MANAGEMENT" &&
      userRole !== "TEACHER"
    ) {
      return NextResponse.redirect(new URL("/login", APP_URL));
    }

    return response;
  } catch {
    // JWT غير صالح أو منتهي الصلاحية
    return clearCookiesAndRedirect();
  }
}

export const config = {
  matcher: [
    "/((?!_next/image|favicon.ico|sw.js|push-sw.js|manifest.json|fonts|images|icons|sounds).*)",
  ],
};
