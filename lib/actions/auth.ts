"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateUniqueHandle } from "@/lib/auth/handle";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  assertSessionSecretConfigured,
  createSession,
  clearSession,
} from "@/lib/auth/session";
import {
  createUser,
  findUserByEmail,
  isEmailTaken,
} from "@/lib/queries/users";
import { createPhotographerProfile } from "@/lib/queries/photographers";
import { firstZodError, loginSchema, registerBuyerSchema, registerPhotographerSchema } from "@/lib/validation/schemas";

export type AuthState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  assertSessionSecretConfigured();
  const user = await findUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { error: "E-mail ou senha incorretos" };
  }

  await createSession(user.id, user.role);
  revalidatePath("/", "layout");

  if (user.role === "admin") redirect("/admin");
  if (user.role === "photographer") redirect("/painel");
  redirect("/marketplace");
}

export async function registerAction(
  prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const role = formData.get("role");
  if (role === "photographer") {
    return registerPhotographerAction(prev, formData);
  }
  return registerBuyerAction(prev, formData);
}

export async function registerBuyerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerBuyerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptTerms: formData.get("acceptTerms"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  assertSessionSecretConfigured();
  if (await isEmailTaken(parsed.data.email)) {
    return { error: "Este e-mail ja esta cadastrado" };
  }

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    role: "buyer",
  });

  await createSession(user.id, "buyer");
  revalidatePath("/", "layout");
  redirect("/marketplace");
}

export async function registerPhotographerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerPhotographerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    acceptTerms: formData.get("acceptTerms"),
  });
  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  assertSessionSecretConfigured();
  if (await isEmailTaken(parsed.data.email)) {
    return { error: "Este e-mail ja esta cadastrado" };
  }

  const handle = await generateUniqueHandle(parsed.data.name, parsed.data.email);

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: hashPassword(parsed.data.password),
    role: "photographer",
  });

  await createPhotographerProfile({
    userId: user.id,
    handle,
    specialties: ["Pista", "Drift"],
  });

  await createSession(user.id, "photographer");
  revalidatePath("/", "layout");
  redirect("/painel");
}

export async function logoutAction(): Promise<void> {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/");
}
