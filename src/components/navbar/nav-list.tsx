"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useReactiveVar } from "@apollo/client/react";
// APOLLO STORE
import { userVar } from "../../../apollo/store";
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
import { Menu, MenuItemWithChild, MenuItem as NavMenuItem } from "models/Navigation.model";
// LIVE CATEGORIES
import { useQuery } from "lib/hooks/useQuery";
import { GET_CATEGORIES } from "../../../apollo/user/query";
import { T } from "lib/types/common";

interface GqlCategory {
  _id: string;
  categoryName: string;
  parentCategoryId: string | null;
}

// ==============================================================
type Props = { navigation: Menu[] };
// ==============================================================

export function NavigationList({ navigation }: Props) {
  const { t } = useTranslation();
  const user = useReactiveVar(userVar);
  const isLoggedIn = !!user._id;
  const [liveCategoryChildren, setLiveCategoryChildren] = useState<MenuItemWithChild[]>([]);

  /** APOLLO REQUESTS — fetch real categories for the "Categories" nav item **/
  useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 50, search: {} } },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const all: GqlCategory[] = data?.getCategories?.list ?? [];
      const topLevel = all.filter((c) => !c.parentCategoryId);
      const childCategories = all.filter((c) => !!c.parentCategoryId);

      const built: MenuItemWithChild[] = topLevel.map((parent) => {
        const subs = childCategories.filter((c) => c.parentCategoryId === parent._id);
        return {
          title: parent.categoryName,
          url: `/products/search?categoryId=${parent._id}`,
          ...(subs.length > 0 && {
            child: subs.map((c) => ({
              title: c.categoryName,
              url: `/products/search?categoryId=${c._id}`,
            })),
          }),
        };
      });

      if (built.length > 0) setLiveCategoryChildren(built);
    },
  });

  const withCustomerSupport = (list: Menu[]): Menu[] => {
    const normalized = list.map((item) => {
      if (item.title.trim().toLowerCase() !== "cs") return item;

      return {
        title: "CS",
        url: "/notices",
        megaMenu: false as const,
        megaMenuWithSub: false as const,
        child: [] as MenuItemWithChild[]
      };
    });

    const exists = normalized.some((item) => item.title.trim().toLowerCase() === "cs");
    if (exists) return normalized;

    const csMenu: NavMenuItem = {
      title: "CS",
      url: "/notices",
      megaMenu: false,
      megaMenuWithSub: false,
      child: [] as MenuItemWithChild[]
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
      // For the "Categories" menu item — swap in live backend data when available
      const isCategories = nav.title.trim().toLowerCase() === "categories";
      const effectiveChildren: MenuItemWithChild[] =
        isCategories && liveCategoryChildren.length > 0
          ? liveCategoryChildren
          : (nav.child as MenuItemWithChild[]);

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
      if (nav.megaMenu === false && nav.megaMenuWithSub === false && effectiveChildren.length === 0 && nav.url) {
        return (
          <StyledNavLink href={nav.url} key={nav.title}>
            {t(nav.title, { defaultValue: nav.title })}
          </StyledNavLink>
        );
      }

      // SHOW LIST MENU WITH CHILD
      if (effectiveChildren && effectiveChildren.length > 0 && nav.megaMenu === false && nav.megaMenuWithSub === false) {
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
                {renderNestLevel(effectiveChildren)}
              </Card>
            </ChildNavListWrapper>
          </FlexBox>
        );
      }
    });
  };

  return (
    <FlexBox gap={4}>
      {renderRootLevel(withCustomerSupport(navigation))}
      {isLoggedIn && (
        <StyledNavLink href="/profile">{t("My Profile", { defaultValue: "My Profile" })}</StyledNavLink>
      )}
    </FlexBox>
  );
}
