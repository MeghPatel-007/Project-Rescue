import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    const callbackTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    signInUrl.searchParams.set("callbackUrl", callbackTarget);
    return NextResponse.redirect(signInUrl);
  }

  const response = NextResponse.next();

  const urlWorkspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (urlWorkspaceId) {
    response.cookies.set("project_rescue_active_workspace", urlWorkspaceId, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/repositories/:path*",
    "/findings/:path*",
    "/recovery-plans/:path*",
    "/ai-activity/:path*",
    "/commit-history/:path*",
    "/jobs/:path*",
    "/settings/:path*",
    "/activity/:path*",
  ],
};
