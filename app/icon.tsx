import { ImageResponse } from "next/og";
import { BRAND_NAVY } from "@/components/site/BrandMark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: the brand mark, navy circle + white cross.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_NAVY,
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", width: 7, height: 17, background: "#fff" }} />
        <div style={{ position: "absolute", width: 17, height: 7, background: "#fff" }} />
      </div>
    ),
    size,
  );
}
