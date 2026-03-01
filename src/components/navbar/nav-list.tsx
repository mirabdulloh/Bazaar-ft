"use client";

import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useTranslation } from "../../../node_modules/react-i18next";
// GLOBAL CUSTOM COMPONENTS
import { NavLink } from "components/nav-link";
import FlexBox from "components/flex-box/flex-box";
// LOCAL CUSTOM COMPONENTS
import MegaMenu from "./mega-menu";
import NavItemChild from "./nav-item-child";
import { CategoryBasedMenu } from "./category-based-menu";
// STYLED COMPONENTS
import { NAV_LINK_STYLES, ChildNavListWrapper, StyledNavLink } from "./styles";
// DATA TYPES
import { Menu, MenuItemWithChild } from "models/Navigation.model";

// ==============================================================
type Props = { navigation: Menu[] };
// ==============================================================

export function NavigationList({ navigation }: Props) {
  const { t } = useTranslation();
  const withCustomerSupport = (list: Menu[]): Menu[] => {
    const normalized = list.map((item) => {
      if (item.title.trim().toLowerCase() !== "cs") return item;

      return {
        title: "CS",
        url: "/notices",
        megaMenu: false,
        megaMenuWithSub: false,
        child: []
      };
    });

    const exists = normalized.some((item) => item.title.trim().toLowerCase() === "cs");
    if (exists) return normalized;

    const csMenu: Menu = {
      title: "CS",
      url: "/notices",
      megaMenu: false,
      megaMenuWithSub: false,
      child: []
    };

    return [...normalized, csMenu];
  };

  const renderNestLevel = (children: MenuItemWithChild[]) => {
    return children.map((nav) => {
      if (nav.child) {
        return (
          <NavItemChild nav={{ ...nav, title: t(nav.title, { defaultValue: nav.title }) }} key={nav.title}>
            {renderNestLevel(nav.child)}
          </NavItemChild>
        );
      }

      return (
        <NavLink href={nav.url!} key={nav.title}>
          <MenuItem>{t(nav.title, { defaultValue: nav.title })}</MenuItem>
        </NavLink>
      );
    });
  };

  const renderRootLevel = (list: Menu[]) => {
    return list.map((nav) => {
      // SHOW GRID MEGA MENU
      if (nav.megaMenu) {
        return (
          <MegaMenu
            key={nav.title}
            title={t(nav.title, { defaultValue: nav.title })}
            menuList={nav.child}
          />
        );
      }

      // SHOW CATEGORY BASED MEGA MENU WITH SUB ITEMS
      if (nav.megaMenuWithSub) {
        return (
          <CategoryBasedMenu
            key={nav.title}
            title={t(nav.title, { defaultValue: nav.title })}
            menuList={nav.child}
          />
        );
      }

      // SHOW DIRECT LINK (no children)
      if (nav.megaMenu === false && nav.megaMenuWithSub === false && nav.child.length === 0 && nav.url) {
        return (
          <StyledNavLink href={nav.url} key={nav.title}>
            {t(nav.title, { defaultValue: nav.title })}
          </StyledNavLink>
        );
      }

      // SHOW LIST MENU WITH CHILD
      if (nav.child && nav.child.length > 0 && nav.megaMenu === false && nav.megaMenuWithSub === false) {
        return (
          <FlexBox
            key={nav.title}
            alignItems="center"
            position="relative"
            flexDirection="column"
            sx={{
              "&:hover": {
                "& > .child-nav-item": {
                  display: "block"
                }
              }
            }}
          >
            <FlexBox alignItems="flex-end" gap={0.3} sx={NAV_LINK_STYLES}>
              {t(nav.title, { defaultValue: nav.title })}{" "}
              <KeyboardArrowDown
                sx={{
                  color: "grey.500",
                  fontSize: "1.1rem"
                }}
              />
            </FlexBox>

            <ChildNavListWrapper className="child-nav-item">
              <Card
                elevation={5}
                sx={{
                  mt: 2.5,
                  py: 1,
                  minWidth: 100,
                  overflow: "unset"
                }}
              >
                {renderNestLevel(nav.child)}
              </Card>
            </ChildNavListWrapper>
          </FlexBox>
        );
      }
    });
  };

  return <FlexBox gap={4}>{renderRootLevel(withCustomerSupport(navigation))}</FlexBox>;
}
