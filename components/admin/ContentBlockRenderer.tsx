import type { ContentBlock } from "@/lib/queries/site-settings";

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-corsa flex flex-col gap-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h1
                key={index}
                className="font-heading text-3xl font-bold text-corsa-wine"
              >
                {block.content}
              </h1>
            );
          case "subheading":
            return (
              <h2
                key={index}
                className="font-heading text-xl font-semibold text-corsa-ink"
              >
                {block.content}
              </h2>
            );
          case "paragraph":
            return (
              <p key={index} className="text-base leading-relaxed text-corsa-muted">
                {block.content}
              </p>
            );
          case "separator":
            return (
              <hr
                key={index}
                className="my-2 border-corsa-border"
                aria-hidden="true"
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
