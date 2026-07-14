import { ImageResponse } from "next/og";
import { BRAND_NAVY } from "@/components/site/BrandMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon: navy circle on white, so it reads on any home screen.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <div
          style={{
            width: 156,
            height: 156,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BRAND_NAVY,
            borderRadius: "50%",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", width: 34, height: 83, background: "#fff" }} />
          <div style={{ position: "absolute", width: 83, height: 34, background: "#fff" }} />
        </div>
      </div>
    ),
    size,
  );
}
