import { ImageResponse } from "next/og";
import {
  CORSA_LOGO_PATH,
  CORSA_LOGO_VIEWBOX,
} from "@/lib/brand/logo";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  const logoWidth = 140;
  const scale = logoWidth / CORSA_LOGO_VIEWBOX.width;
  const logoHeight = CORSA_LOGO_VIEWBOX.height * scale;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#5D1923",
        }}
      >
        <svg
          width={logoWidth}
          height={logoHeight}
          viewBox={`0 0 ${CORSA_LOGO_VIEWBOX.width} ${CORSA_LOGO_VIEWBOX.height}`}
        >
          <path d={CORSA_LOGO_PATH} fill="#FDFDFD" />
        </svg>
      </div>
    ),
    {
      ...size,
    },
  );
}
