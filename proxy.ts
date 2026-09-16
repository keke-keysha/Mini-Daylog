import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/login";
  const isAuthEndpoint = pathname.startsWith("/api/auth");

  if (isAuthEndpoint) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });

  if (isLogin && token) return NextResponse.redirect(new URL("/", request.url));
  if (!isLogin && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};
