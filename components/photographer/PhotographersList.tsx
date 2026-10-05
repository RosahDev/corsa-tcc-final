"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ImageIcon, Search } from "lucide-react";
import type { PhotographerRow } from "@/lib/queries/photographers";
import { PhotographerAvatar } from "@/components/photographer/PhotographerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";

type PhotographersListProps = {
  photographers: PhotographerRow[];
};

function matchesSearch(photographer: PhotographerRow, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    photographer.name,
    photographer.handle,
    photographer.bio ?? "",
    ...photographer.specialties,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function PhotographersList({ photographers }: PhotographersListProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => photographers.filter((p) => matchesSearch(p, query)),
    [photographers, query],
  );

  return (
    <>
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-corsa-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome, handle ou especialidade..."
          className="pl-10"
          aria-label="Buscar fotógrafos"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="size-7" />}
          title="Nenhum fotógrafo encontrado"
          description={
            query
              ? "Tente outro termo de busca."
              : "Ainda não há fotógrafos cadastrados na plataforma."
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/fotografos/${p.handle}`}>
              <Card className="h-full p-6 transition-shadow hover:shadow-[var(--shadow-elevated)]">
                <PhotographerAvatar
                  avatarKey={p.avatar_key}
                  name={p.name}
                  size="md"
                  className="mb-4"
                />
                <h2 className="text-lg font-semibold text-corsa-ink">{p.name}</h2>
                <p className="text-sm text-corsa-wine">@{p.handle}</p>
                {p.bio && (
                  <p className="mt-3 line-clamp-2 text-sm text-corsa-muted">{p.bio}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.specialties.slice(0, 3).map((s) => (
                    <Badge key={s} variant="sand">
                      {s}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-4 text-xs text-corsa-muted">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="size-3" />
                    {p.album_count} álbuns
                  </span>
                  <span>{p.photo_count} fotos</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {query && filtered.length > 0 && (
        <p className="mt-6 text-sm text-corsa-muted">
          {filtered.length} de {photographers.length} fotógrafo
          {photographers.length !== 1 ? "s" : ""}
        </p>
      )}
    </>
  );
}
