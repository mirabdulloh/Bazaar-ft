import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

export const geist = Geist({
  subsets: ["latin"]
});

import "overlayscrollbars/overlayscrollbars.css";

// THEME PROVIDER
import ThemeProvider from "theme/theme-provider";

// PRODUCT CART PROVIDER
import CartProvider from "contexts/CartContext";

// SITE SETTINGS PROVIDER
import SettingsProvider from "contexts/SettingContext";

// APOLLO CLIENT PROVIDER
import ApolloWrapper from "components/ApolloWrapper";

// GLOBAL CUSTOM COMPONENTS
import RTL from "components/rtl";
import ProgressBar from "components/progress";
import InitialBrandLoader from "components/initial-brand-loader";

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
        <ApolloWrapper>
          <CartProvider>
            <SettingsProvider>
              <ThemeProvider>
                <RTL>
                  <InitialBrandLoader>
                    {modal}
                    {children}
                  </InitialBrandLoader>
                </RTL>

                <ProgressBar />
              </ThemeProvider>
            </SettingsProvider>
          </CartProvider>
        </ApolloWrapper>

        <GoogleAnalytics gaId="G-XKPD36JXY0" />
      </body>
    </html>
  );
}
