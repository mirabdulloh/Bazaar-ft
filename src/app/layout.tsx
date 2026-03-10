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
import { ChatProvider } from "components/chat/chat-provider";
import { SocketProvider } from "providers/SocketProvider";
import { ChatWidget } from "components/chat/chat-widget/ChatWidget";
import { SupportChatButton } from "components/chat/support-chat/SupportChatButton";
import { SupportChatWindow } from "components/chat/support-chat/SupportChatWindow";

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
          <SocketProvider>
            <CartProvider>
              <VariantPickerProvider>
                <SettingsProvider>
                  <ThemeProvider>
                    <RTL>
                      <ChatProvider>
                        <InitialBrandLoader>
                          {modal}
                          {children}
                        </InitialBrandLoader>
                        <ChatWidget />
                        <SupportChatButton />
                        <SupportChatWindow />
                      </ChatProvider>
                    </RTL>

                    <ProgressBar />
                    <VariantPickerModal />
                  </ThemeProvider>
                </SettingsProvider>
              </VariantPickerProvider>
            </CartProvider>
          </SocketProvider>
        </ApolloWrapper>

        <GoogleAnalytics gaId="G-XKPD36JXY0" />
      </body>
    </html>
  );
}
