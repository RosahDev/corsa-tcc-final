"use client";

import { useMemo, useState } from "react";
import { Images, Plus, Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { CreateAlbumForm } from "@/components/studio/CreateAlbumForm";
import { EditAlbumForm } from "@/components/studio/EditAlbumForm";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { STUDIO_FORM_DIALOG_CLASS } from "@/components/studio/studioFormDialog";
import type { AlbumListItem } from "@/lib/queries/albums";

type AlbumListProps = {
  albums: AlbumListItem[];
  salesByAlbum?: Record<string, number>;
};

function matchesAlbumSearch(album: AlbumListItem, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    album.title,
    album.city,
    album.state,
    album.vehicle_type,
    album.modality,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function AlbumList({ albums, salesByAlbum = {} }: AlbumListProps) {
  const [creating, setCreating] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [editingAlbum, setEditingAlbum] = useState<AlbumListItem | null>(null);
  const [query, setQuery] = useState("");

  function openCreateModal() {
    setCreateFormKey((key) => key + 1);
    setCreating(true);
  }

  const filtered = useMemo(
    () => albums.filter((album) => matchesAlbumSearch(album, query)),
    [albums, query],
  );

  return (
    <>
      {albums.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Nenhum álbum criado ainda"
          description="Crie seu primeiro álbum para começar a publicar fotos no marketplace."
          actionLabel="Criar primeiro álbum"
          onAction={openCreateModal}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {albums.length > 3 ? (
              <div className="relative sm:max-w-md sm:flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar álbuns..."
                  className="pl-10"
                  aria-label="Buscar álbuns"
                />
              </div>
            ) : (
              <p className="text-sm text-corsa-muted">
                {albums.length}{" "}
                {albums.length === 1 ? "álbum cadastrado" : "álbuns cadastrados"}
              </p>
            )}
            <Button
              className="shrink-0"
              onClick={openCreateModal}
            >
              <Plus className="size-4" />
              Adicionar álbum
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Search className="size-7" />}
              title="Nenhum álbum encontrado"
              description="Tente outro termo de busca."
              className="py-10"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((album) => {
                const salesCount = salesByAlbum[album.id] ?? 0;

                return (
                <Card
                  key={album.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-corsa-ink">{album.title}</p>
                    <p className="text-sm text-corsa-muted">
                      {formatCurrency(album.bundle_price_cents)} ·{" "}
                      {album.photo_count} fotos · {album.city}/{album.state}
                      {salesCount > 0 && (
                        <>
                          {" "}
                          · {salesCount}{" "}
                          {salesCount === 1 ? "venda" : "vendas"}
                        </>
                      )}
                    </p>
                    <Badge
                      className="mt-2"
                      variant={album.published_at ? "success" : "muted"}
                    >
                      {album.published_at ? "Publicado" : "Rascunho"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      href={`/painel/albuns/${album.id}`}
                    >
                      Ver fotos
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingAlbum(album)}
                    >
                      Editar informações
                    </Button>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog
        open={creating}
        onOpenChange={setCreating}
        title="Novo álbum"
        description="Preencha os dados do álbum para publicar no marketplace."
        contentClassName={STUDIO_FORM_DIALOG_CLASS}
      >
        {creating && (
          <CreateAlbumForm
            key={createFormKey}
            onSuccess={() => setCreating(false)}
          />
        )}
      </Dialog>

      {editingAlbum && (
        <Dialog
          open={!!editingAlbum}
          onOpenChange={(open) => {
            if (!open) setEditingAlbum(null);
          }}
          title="Editar álbum"
          description={editingAlbum.title}
          contentClassName={STUDIO_FORM_DIALOG_CLASS}
        >
          <EditAlbumForm
            key={editingAlbum.id}
            album={editingAlbum}
            onSuccess={() => setEditingAlbum(null)}
          />
        </Dialog>
      )}
    </>
  );
}
