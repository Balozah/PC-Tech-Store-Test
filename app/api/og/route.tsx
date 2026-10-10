import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/data";

// Generic share card for the home page until the client supplies a logo/brand image.
// Latin-only text: the built-in OG renderer has no Arabic shaping.
// Cached so a public endpoint can't be used to burn function invocations.
export const revalidate = 86400;

const PAPER = "#F2F2EF";
const INK = "#0E0E10";
const LINE = "#D6D6D1";

// Archivo cuts subset to the card's text: wide 800 for the name, regular
// for the rest. If Google Fonts is unreachable the card renders in the
// default face.
async function loadFont(axes: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@${axes}&text=${encodeURIComponent(text)}`
    ).then((r) => r.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const settings = await getSiteSettings();
  const [first = "", ...rest] = (settings.business_name_en || "").split(" ");
  const tagline = "PC parts · Laptops · Pre-built PCs · Accessories";
  const cta = "Order on WhatsApp";
  const [display, text] = await Promise.all([
    loadFont("125,800", settings.business_name_en || "Tech RT"),
    loadFont("100,400", tagline + cta),
  ]);
  const fonts = [
    ...(display ? [{ name: "Archivo Display", data: display, weight: 800 as const, style: "normal" as const }] : []),
    ...(text ? [{ name: "Archivo Text", data: text, weight: 400 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          color: INK,
          fontFamily: text ? "Archivo Text" : undefined,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 88px", gap: 36 }}>
          {first && (
            <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 120, fontWeight: 800, letterSpacing: -4, fontFamily: display ? "Archivo Display" : undefined }}>
              <div style={{ display: "flex", background: INK, color: PAPER, padding: "4px 22px" }}>{first}</div>
              {rest.length > 0 && <div style={{ display: "flex" }}>{rest.join(" ")}</div>}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 40, color: "#5A5A61" }}>{tagline}</div>
        </div>
        <div style={{ display: "flex", height: 150, background: INK, alignItems: "center", padding: "0 88px", gap: 28 }}>
          <svg width="72" height="72" viewBox="0 0 64 64">
            <g stroke={PAPER} strokeWidth="3" strokeLinecap="square">
              <path d="M24 11v6M32 11v6M40 11v6M24 47v6M32 47v6M40 47v6M11 24h6M11 32h6M11 40h6M47 24h6M47 32h6M47 40h6" />
            </g>
            <rect x="18.5" y="18.5" width="27" height="27" fill="none" stroke={PAPER} strokeWidth="3" />
            <rect x="26" y="26" width="12" height="12" fill="#7EA6FF" />
          </svg>
          <div style={{ display: "flex", fontSize: 36, color: PAPER }}>{cta}</div>
          <div style={{ display: "flex", flex: 1, height: 1, background: LINE, opacity: 0.25 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length ? fonts : undefined,
    }
  );
}
