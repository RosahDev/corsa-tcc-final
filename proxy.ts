import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/constants";
import { parseSessionToken } from "@/lib/auth/session";

const buyerRoutes = [
  "/minha-galeria",
  "/favoritos",
  "/meus-pedidos",
  "/minha-conta",
];
const studioRoutes = ["/painel"];
const adminRoutes = ["/admin"];
const authRoutes = ["/entrar", "/criar-conta"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = parseSessionToken(token);

  const isBuyerRoute = buyerRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isStudioRoute = studioRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if ((isBuyerRoute || isStudioRoute || isAdminRoute) && !session) {
    const loginUrl = new URL("/entrar", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isBuyerRoute && session?.role === "photographer") {
    return NextResponse.redirect(new URL("/painel", request.url));
  }

  if (isBuyerRoute && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isStudioRoute && session?.role === "buyer") {
    return NextResponse.redirect(new URL("/minha-galeria", request.url));
  }

  if (isStudioRoute && session?.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAuthRoute && session) {
    const dest =
      session.role === "admin"
        ? "/admin"
        : session.role === "photographer"
          ? "/painel"
          : "/marketplace";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/minha-galeria/:path*",
    "/favoritos/:path*",
    "/meus-pedidos/:path*",
    "/minha-conta/:path*",
    "/painel/:path*",
    "/admin/:path*",
    "/entrar/:path*",
    "/criar-conta/:path*",
  ],
};
