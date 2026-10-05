import { NextResponse } from "next/server";
import { findPhotoById } from "@/lib/queries/photos";
import { readPreview } from "@/lib/media/storage";
import { isMediaNotFound } from "@/lib/media/supabase-storage";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/fotos/[id]/preview">,
) {
  const { id } = await ctx.params;
  const photo = await findPhotoById(id);
  if (!photo) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buffer = await readPreview(photo.preview_key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    if (isMediaNotFound(error)) {
      return new NextResponse("Not found", { status: 404 });
    }
    console.error("Could not load photo preview", error);
    return new NextResponse("Could not load image", { status: 500 });
  }
}
