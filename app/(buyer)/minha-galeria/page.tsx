export const dynamic = "force-dynamic";

import Image from "next/image";
import { Download, Search } from "lucide-react";
import { requireBuyer } from "@/lib/auth/current-user";
import { listPurchasedPhotos } from "@/lib/queries/photos";
import { formatShortDate } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default async function MinhaGaleriaPage({
  searchParams,
}: PageProps<"/minha-galeria">) {
  const user = await requireBuyer();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;

  const photos = await listPurchasedPhotos(user.id, { q });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-corsa-wine">
        Minha galeria
      </h1>
      <p className="mt-1 text-sm text-corsa-muted">
        Fotos adquiridas com download em alta resolução
      </p>

      <form className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted" />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por álbum, marca ou título"
          className="pl-10"
        />
      </form>

      {photos.length === 0 ? (
        <EmptyState
          icon={<Download className="size-7" />}
          title="Nenhuma foto ainda"
          description="Suas compras aparecerão aqui com download liberado."
          actionLabel="Explorar marketplace"
          actionHref="/marketplace"
          className="mt-8"
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden p-0">
              <div className="relative aspect-[4/3] bg-corsa-sand">
                <Image
                  src={`/api/fotos/${photo.id}/preview`}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-corsa-ink">{photo.album_title}</p>
                <p className="text-xs text-corsa-muted">
                  {photo.album_city}/{photo.album_state} ·{" "}
                  {formatShortDate(photo.purchased_at)}
                </p>
                <Button
                  size="sm"
                  href={`/api/fotos/${photo.id}/download`}
                  className="mt-3"
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
