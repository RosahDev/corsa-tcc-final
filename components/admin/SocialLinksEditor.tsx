"use client";

import { Plus, Trash2 } from "lucide-react";
import type { SocialLink } from "@/lib/queries/site-settings";
import { Button } from "@/components/ui/Button";
import { ConfirmAction } from "@/components/ui/ConfirmAction";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const iconOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "mail", label: "E-mail" },
  { value: "share", label: "Compartilhar" },
  { value: "camera", label: "Câmera" },
  { value: "link", label: "Link" },
];

type SocialLinksEditorProps = {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
};

export function SocialLinksEditor({ links, onChange }: SocialLinksEditorProps) {
  function updateLink(index: number, patch: Partial<SocialLink>) {
    onChange(
      links.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  function addLink() {
    onChange([...links, { label: "", url: "", icon: "link" }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {links.map((link, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-xl border border-corsa-border bg-corsa-cream/40 p-4 sm:grid-cols-[1fr_1fr_auto_auto]"
        >
          <Input
            value={link.label}
            onChange={(e) => updateLink(index, { label: e.target.value })}
            placeholder="Nome (ex: Instagram)"
            className="bg-white"
          />
          <Input
            value={link.url}
            onChange={(e) => updateLink(index, { url: e.target.value })}
            placeholder="https://..."
            className="bg-white"
          />
          <Select
            value={link.icon ?? "link"}
            onChange={(e) => updateLink(index, { icon: e.target.value })}
            className="bg-white"
          >
            {iconOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <ConfirmAction
            title="Remover rede social"
            description={
              link.label
                ? `"${link.label}" será removida da lista. Salve as alterações para aplicar.`
                : "Este link será removido da lista. Salve as alterações para aplicar."
            }
            confirmLabel="Remover"
            onConfirm={() => removeLink(index)}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover link"
            >
              <Trash2 className="size-4 text-corsa-wine" />
            </Button>
          </ConfirmAction>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addLink}>
        <Plus className="size-4" />
        Adicionar rede social
      </Button>
    </div>
  );
}
