"use client";

import { Fragment, PropsWithChildren, useCallback, useState } from "react";
import Divider from "@mui/material/Divider";
// GLOBAL CUSTOM COMPONENTS
import Sticky from "components/sticky";
import StickyWrapper from "components/sticky-wrapper";
import SideNavbarTwo from "components/page-sidenav/side-navbar-2";
import { NavigationList } from "components/navbar";
import { CategoryList } from "components/categories";
import { MobileMenu } from "components/mobile-navbar/mobile-menu";
import { MobileNavigationBar } from "components/mobile-navigation";
import {
  Header,
  HeaderCart,
  HeaderLogin,
  HeaderNotifications,
  MobileHeader,
  HeaderSearch
} from "components/header";
import { Topbar, TopbarLanguageSelector, TopbarSocialLinks, TopbarLatestNotice } from "components/topbar";
import { SearchInput2 } from "components/search-box";
// LOCAL CUSTOM COMPONENTS
import Footer from "./footer";
// CUSTOM DATA MODEL
import { Category } from "models/Common";
import LayoutModel from "models/Layout.model";

// SIDEBAR FOOTER LINKS
const footerLinks = [
  { id: 1, title: "Terms", url: "/" },
  { id: 2, title: "Privacy", url: "/" },
  { id: 3, title: "Help", url: "/" }
];

// ==============================================================
interface Props extends PropsWithChildren {
  data: LayoutModel;
  navigation: Category[];
}
// ==============================================================

export default function ShopLayout4({ children, navigation, data }: Props) {
  const { topbar, header, mobileNavigation } = data;

  const [isFixed, setIsFixed] = useState(false);
  const toggleIsFixed = useCallback((fixed: boolean) => setIsFixed(fixed), []);

  // SIDEBAR CONTENT
  const Sidebar =
    navigation.length > 0 ? (
      <Fragment>
        <SideNavbarTwo navigation={navigation} />
        <Footer links={footerLinks} />
      </Fragment>
    ) : null;

  const MOBILE_VERSION_HEADER = (
    <MobileHeader>
      <MobileHeader.Left>
        <MobileHeader.Logo logoUrl={mobileNavigation.logo} />
      </MobileHeader.Left>

      <MobileHeader.Right>
        <HeaderLogin />

        <HeaderSearch>
          <SearchInput2 />
        </HeaderSearch>

        <HeaderNotifications />
        <HeaderCart />
        <MobileMenu navigation={header.navigation} />
      </MobileHeader.Right>
    </MobileHeader>
  );

  return (
    <Fragment>
      <Topbar>
        <TopbarLatestNotice label={topbar.label} fallbackTitle={topbar.title} />

        <Topbar.Right>
          <TopbarLanguageSelector languages={topbar.languageOptions} />
          <TopbarSocialLinks links={topbar.socials} />
        </Topbar.Right>
      </Topbar>

      <Sticky fixedOn={0} onSticky={toggleIsFixed} scrollDistance={150}>
        <Header mobileHeader={MOBILE_VERSION_HEADER}>
          <Header.Left>
            <Header.Logo url={header.logo} />

            {isFixed && (
              <Header.CategoryDropdown>
                <CategoryList categories={header.categoryMenus} />
              </Header.CategoryDropdown>
            )}
          </Header.Left>

          <Header.Mid>
            <NavigationList navigation={header.navigation} />
          </Header.Mid>

          <Header.Right>
            <HeaderLogin />
            <HeaderNotifications />
            <HeaderCart />
          </Header.Right>
        </Header>
      </Sticky>

      <Divider />

      <StickyWrapper SideNav={Sidebar}>{children}</StickyWrapper>

      <MobileNavigationBar navigation={mobileNavigation.version1} />
    </Fragment>
  );
}
