export const CORSA_LOGO_VIEWBOX = { width: 460, height: 372 } as const;

export const CORSA_LOGO_PATH =
  "M125.941 253C136.34 275.8 162.607 281.167 174.441 281H402.441L309.941 371.5H155C92.6002 372.3 101.5 277 125.941 253ZM377.941 88H214.941C138.941 83.6 85.9406 120.833 68.9406 140C117.341 107.2 186.441 105.333 214.941 108.5C46.0002 241 94.0002 348.5 107 362C75.8002 347.6 29.9405 302.833 13.9406 281C-15.2592 236.2 8.10729 184.667 23.4406 164.5L112.941 49.5C148.94 13.9001 203.94 1.66674 226.941 0H459.941L377.941 88Z";

export const CORSA_LOGO_SOURCES = {
  primary: "/svgs/logo-primary.svg",
  white: "/svgs/logo-white.svg",
} as const;

export type CorsaLogoVariant = keyof typeof CORSA_LOGO_SOURCES;

export function corsaLogoDimensions(height: number) {
  const width = Math.round(height * (CORSA_LOGO_VIEWBOX.width / CORSA_LOGO_VIEWBOX.height));
  return { width, height };
}

type WatermarkOptions = {
  opacity?: number;
  rotation?: number;
  tileWidthRatio?: number;
};

export function buildTiledWatermarkSvg(
  imageWidth: number,
  imageHeight: number,
  {
    opacity = 0.13,
    rotation = -24,
    tileWidthRatio = 0.09,
  }: WatermarkOptions = {},
): Buffer {
  const tileLogoWidth = Math.max(52, Math.round(imageWidth * tileWidthRatio));
  const tileLogoHeight = Math.round(
    tileLogoWidth * (CORSA_LOGO_VIEWBOX.height / CORSA_LOGO_VIEWBOX.width),
  );
  const spacingX = Math.round(tileLogoWidth * 2.1);
  const spacingY = Math.round(tileLogoHeight * 1.85);
  const scale = tileLogoWidth / CORSA_LOGO_VIEWBOX.width;
  const centerX = CORSA_LOGO_VIEWBOX.width / 2;
  const centerY = CORSA_LOGO_VIEWBOX.height / 2;
  const fill = `rgba(255,255,255,${opacity})`;

  const logos: string[] = [];
  const pad = Math.max(spacingX, spacingY);

  for (let y = -pad; y < imageHeight + pad; y += spacingY) {
    const row = Math.round(y / spacingY);
    const rowOffset = row % 2 === 0 ? 0 : Math.round(spacingX / 2);

    for (let x = -pad + rowOffset; x < imageWidth + pad; x += spacingX) {
      const cx = x + tileLogoWidth / 2;
      const cy = y + tileLogoHeight / 2;

      logos.push(
        `<g transform="translate(${cx} ${cy}) rotate(${rotation}) scale(${scale}) translate(${-centerX} ${-centerY})"><path d="${CORSA_LOGO_PATH}" fill="${fill}"/></g>`,
      );
    }
  }

  const svg = `<svg width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}" xmlns="http://www.w3.org/2000/svg">${logos.join("")}</svg>`;

  return Buffer.from(svg);
}
