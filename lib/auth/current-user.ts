import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { findUserById, type UserRow } from "@/lib/queries/users";

export type CurrentUser = UserRow & {
  session: SessionPayload;
  photographerProfileId?: string;
  handle?: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await findUserById(session.userId);
  if (!user) return null;
  return {
    ...user,
    session,
    photographerProfileId: user.photographer_profile_id ?? undefined,
    handle: user.handle ?? undefined,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireBuyer(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "buyer") redirect("/painel");
  return user;
}

export async function requirePhotographer(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "photographer") redirect("/minha-galeria");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
