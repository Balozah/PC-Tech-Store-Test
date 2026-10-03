import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/data";

// Generic share card for the home page until the client supplies a logo/brand image.
// Latin-only text: the built-in OG renderer has no Arabic shaping.
export async function GET() {
  const settings = await getSiteSettings();
  const name = settings.business_name_en || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#0A0A0F",
          color: "#F4F4F5",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <g stroke="#2563EB" strokeWidth="3" strokeLinecap="round">
            <path d="M24 12v6M32 12v6M40 12v6M24 46v6M32 46v6M40 46v6M12 24h6M12 32h6M12 40h6M46 24h6M46 32h6M46 40h6" />
          </g>
          <rect x="18" y="18" width="28" height="28" rx="5" fill="none" stroke="#2563EB" strokeWidth="3" />
          <rect x="26" y="26" width="12" height="12" rx="2" fill="#2563EB" />
        </svg>
        {name && <div style={{ fontSize: 84, fontWeight: 700 }}>{name}</div>}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
