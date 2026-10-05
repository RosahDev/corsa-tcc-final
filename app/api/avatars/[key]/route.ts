import { NextResponse } from "next/server";
import { readAvatar } from "@/lib/media/avatars";
import { isMediaNotFound } from "@/lib/media/supabase-storage";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/avatars/[key]">,
) {
  const { key } = await ctx.params;
  if (!key || key.includes("..") || key.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buffer = await readAvatar(key);
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
    console.error("Could not load avatar", error);
    return new NextResponse("Could not load image", { status: 500 });
  }
}
