"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ContentBlock, ContentBlockType } from "@/lib/queries/site-settings";
import { Button } from "@/components/ui/Button";
import { ConfirmAction } from "@/components/ui/ConfirmAction";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const blockTypeLabels: Record<ContentBlockType, string> = {
  heading: "Título",
  subheading: "Subtítulo",
  paragraph: "Parágrafo",
  separator: "Separador",
};

type ContentBlockEditorProps = {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
};

export function ContentBlockEditor({ blocks, onChange }: ContentBlockEditorProps) {
  function updateBlock(index: number, patch: Partial<ContentBlock>) {
    onChange(
      blocks.map((block, i) => (i === index ? { ...block, ...patch } : block)),
    );
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function addBlock() {
    onChange([...blocks, { type: "paragraph", content: "" }]);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <p className="text-sm text-corsa-muted">
          Nenhum bloco. Adicione títulos, parágrafos ou separadores.
        </p>
      )}

      {blocks.map((block, index) => (
        <div
          key={index}
          className="rounded-xl border border-corsa-border bg-corsa-cream/40 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 flex flex-col gap-3">
              <Select
                value={block.type}
                onChange={(e) =>
                  updateBlock(index, {
                    type: e.target.value as ContentBlockType,
                    content:
                      e.target.value === "separator" ? undefined : block.content,
                  })
                }
                className="max-w-xs"
              >
                {Object.entries(blockTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>

              {block.type !== "separator" && (
                <Input
                  value={block.content ?? ""}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  placeholder="Conteúdo do bloco"
                  className="bg-white"
                />
              )}
            </div>

            <ConfirmAction
              title="Remover bloco"
              description="Este bloco será removido do conteúdo. Salve as alterações para aplicar."
              confirmLabel="Remover"
              onConfirm={() => removeBlock(index)}
            >
              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                aria-label="Remover bloco"
              >
                <Trash2 className="size-4 text-corsa-wine" />
              </Button>
            </ConfirmAction>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addBlock}>
        <Plus className="size-4" />
        Adicionar bloco
      </Button>
    </div>
  );
}
