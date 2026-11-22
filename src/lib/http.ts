import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function zodFail(error: ZodError) {
  const first = error.issues[0];
  return fail(first?.message ?? "بيانات غير صالحة", 422, error.flatten().fieldErrors);
}

export async function currentApiUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}

export type ApiGuard = { user: SessionUser } | { response: NextResponse };

export async function guardUser(): Promise<ApiGuard> {
  const user = await currentApiUser();
  if (!user) return { response: fail("يجب تسجيل الدخول لإتمام هذه العملية", 401) };
  return { user };
}

export async function guardAdmin(): Promise<ApiGuard> {
  const user = await currentApiUser();
  if (!user) return { response: fail("يجب تسجيل الدخول", 401) };
  if (user.role !== "admin") return { response: fail("هذه العملية تتطلب صلاحيات إدارة", 403) };
  return { user };
}

export function toInt(value: unknown, fallback: number | null = null): number | null {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    return typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
