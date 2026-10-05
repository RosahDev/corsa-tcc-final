import { isHandleTaken } from "@/lib/queries/users";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildBaseHandle(name: string, email?: string): string {
  let handle = slugify(name);

  if (handle.length < 3 && email) {
    const localPart = slugify(email.split("@")[0] ?? "");
    handle =
      handle.length > 0
        ? slugify(`${handle}-${localPart}`)
        : localPart;
  }

  if (handle.length < 3) {
    handle = `${handle || "fotografo"}-user`.replace(/-+/g, "-").replace(/^-|-$/g, "");
  }

  return handle.slice(0, 30);
}

export async function generateUniqueHandle(
  name: string,
  email?: string,
): Promise<string> {
  const base = buildBaseHandle(name, email);

  if (!(await isHandleTaken(base))) {
    return base;
  }

  for (let suffix = 2; suffix < 1000; suffix++) {
    const suffixText = `-${suffix}`;
    const candidate = `${base.slice(0, 30 - suffixText.length)}${suffixText}`;
    if (!(await isHandleTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error("Nao foi possivel gerar handle unico");
}
