import type { ZodError } from "zod";

export function getZodError(error: ZodError) {
  return error.issues[0]?.message ?? "Dados invalidos";
}
