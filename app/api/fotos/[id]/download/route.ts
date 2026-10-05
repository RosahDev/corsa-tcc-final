import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { findPhotoById, userOwnsPhoto } from "@/lib/queries/photos";
import { readOriginal } from "@/lib/media/storage";
import { isMediaNotFound } from "@/lib/media/supabase-storage";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/fotos/[id]/download">,
) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await ctx.params;
  const photo = await findPhotoById(id);
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  const owns = await userOwnsPhoto(user.id, id);
  if (!owns) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await readOriginal(photo.original_key);
    const ext = photo.original_key.split(".").pop() ?? "jpg";
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": `image/${ext === "jpg" ? "jpeg" : ext}`,
        "Content-Disposition": `attachment; filename="corsa-${id}.${ext}"`,
      },
    });
  } catch (error) {
    if (isMediaNotFound(error)) {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error("Could not load original photo", error);
    return new NextResponse("Could not load image", { status: 500 });
  }
}
