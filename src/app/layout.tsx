import type { ReactNode } from "react";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { geist } from "lib/fonts";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BAZAAR — Discover & Shop the Best Fashion Brands",
    template: "%s | BAZAAR",
  },
  description:
    "BAZAAR is a multi-brand fashion platform. Discover, follow, and shop your favorite independent clothing brands all in one place.",
  keywords: ["fashion", "clothing", "brands", "streetwear", "style", "marketplace", "BAZAAR"],
  applicationName: "BAZAAR",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BAZAAR",
    title: "BAZAAR — Discover & Shop the Best Fashion Brands",
    description:
      "BAZAAR is a multi-brand fashion platform. Discover, follow, and shop your favorite independent clothing brands all in one place.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "BAZAAR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BAZAAR — Discover & Shop the Best Fashion Brands",
    description:
      "BAZAAR is a multi-brand fashion platform. Discover, follow, and shop your favorite independent clothing brands all in one place.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/assets/images/logo.svg",
    shortcut: "/assets/images/logo.svg",
    apple: "/assets/images/logo.svg",
  },
};

import "overlayscrollbars/overlayscrollbars.css";

// THEME PROVIDER
import ThemeProvider from "theme/theme-provider";

// PRODUCT CART PROVIDER
import CartProvider from "contexts/CartContext";
import VariantPickerProvider from "contexts/VariantPickerContext";
import VariantPickerModal from "components/variant-picker-modal";

// SITE SETTINGS PROVIDER
import SettingsProvider from "contexts/SettingContext";

// APOLLO CLIENT PROVIDER
import ApolloWrapper from "components/ApolloWrapper";

// GLOBAL CUSTOM COMPONENTS
import RTL from "components/rtl";
import ProgressBar from "components/progress";
import InitialBrandLoader from "components/initial-brand-loader";
import I18nClientInit from "components/i18n-client-init";

// IMPORT i18n SUPPORT FILE
import "i18n";

// ==============================================================
interface RootLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}
// ==============================================================

export default function RootLayout({ children, modal }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body id="body" className={geist.className}>
        <I18nClientInit />
        <ApolloWrapper>
          <CartProvider>
            <VariantPickerProvider>
              <SettingsProvider>
                <ThemeProvider>
                  <RTL>
                    <InitialBrandLoader>
                      {modal}
                      {children}
                    </InitialBrandLoader>
                  </RTL>

                  <ProgressBar />
                  <VariantPickerModal />
                </ThemeProvider>
              </SettingsProvider>
            </VariantPickerProvider>
          </CartProvider>
        </ApolloWrapper>

        <GoogleAnalytics gaId="G-XKPD36JXY0" />
      </body>
    </html>
  );
}
