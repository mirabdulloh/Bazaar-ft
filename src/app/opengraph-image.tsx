import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "BAZAAR — Discover & Shop the Best Fashion Brands";

async function getLogoDataUri() {
  const logoPath = join(process.cwd(), "public/assets/images/logo.svg");
  const svg = await readFile(logoPath, "utf8");
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export default async function OpenGraphImage() {
  const logoDataUri = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 48%, #1d4ed8 100%)",
          color: "#ffffff",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 36,
            padding: "42px 48px",
            background: "rgba(15, 23, 42, 0.38)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <img
              src={logoDataUri}
              width={220}
              height={68}
              alt="BAZAAR logo"
              style={{ objectFit: "contain" }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(255,255,255,0.75)",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Multi-Brand Fashion Platform
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 760,
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 74,
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              Discover and shop the best fashion brands.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.84)",
              }}
            >
              Explore clothing, shoes, accessories, and community stories from independent brands on BAZAAR.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              color: "rgba(255,255,255,0.78)",
            }}
          >
            <div style={{ display: "flex" }}>bazaar</div>
            <div style={{ display: "flex" }}>Fashion. Brands. Community.</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
