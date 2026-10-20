import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export function jsonUnauthorized(message = "Unauthorized: Authentication required") {
  return NextResponse.json({ error: message, code: "UNAUTHORIZED" }, { status: 401 });
}

export function jsonForbidden(message = "Forbidden: Insufficient permissions") {
  return NextResponse.json({ error: message, code: "FORBIDDEN" }, { status: 403 });
}

export function jsonBadRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, code: "BAD_REQUEST", details }, { status: 400 });
}

export function jsonNotFound(message = "Resource not found") {
  return NextResponse.json({ error: message, code: "NOT_FOUND" }, { status: 404 });
}

export function jsonError(error: unknown) {
  if (error && typeof error === "object" && "statusCode" in error && "code" in error) {
    const err = error as { message: string; code: string; statusCode: number };
    return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
  }

  const message = error instanceof Error ? error.message : "An unexpected server error occurred";
  return NextResponse.json({ error: message, code: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}
