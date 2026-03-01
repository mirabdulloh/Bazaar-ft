"use client";

import { useState } from "react";
import { CategoryList } from "components/categories";
import { CategoryMenuItem } from "models/Category.model";
import { useQuery } from "lib/hooks/useQuery";
import { GET_CATEGORIES } from "../../../apollo/user/query";
import { T } from "lib/types/common";

interface GqlCategory {
  _id: string;
  categoryName: string;
  parentCategoryId: string | null;
}

// Maps category name keywords → icon key (from src/icons/index.ts)
const ICON_MAP: Record<string, string> = {
  men:         "ShirtLine",
  women:       "Woman",
  woman:       "Woman",
  kids:        "BabyBoy",
  children:    "BabyBoy",
  accessories: "GiftLine",
};

function resolveIcon(name: string): string | undefined {
  const lower = name.toLowerCase();
  for (const [word, icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(word)) return icon;
  }
  return undefined;
}

export default function LiveCategoryList() {
  const [items, setItems] = useState<CategoryMenuItem[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: _getCategoriesLoading,
    data: _getCategoriesData,
    error: _getCategoriesError,
    refetch: _getCategoriesRefetch,
  } = useQuery(GET_CATEGORIES, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 50, search: {} } },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      const all: GqlCategory[] = data?.getCategories?.list ?? [];
      const topLevel = all.filter((c) => !c.parentCategoryId);
      const childCategories = all.filter((c) => !!c.parentCategoryId);

      const menuItems: CategoryMenuItem[] = topLevel.map((parent) => {
        const subs = childCategories.filter((c) => c.parentCategoryId === parent._id);
        return {
          title: parent.categoryName,
          href: `/products/search?categoryId=${parent._id}`,
          icon: resolveIcon(parent.categoryName),
          ...(subs.length > 0 && {
            component: "List" as const,
            children: subs.map((c) => ({
              title: c.categoryName,
              href: `/products/search?categoryId=${c._id}`,
            })),
          }),
        };
      });

      setItems(menuItems);
    },
  });

  if (!items.length) return null;

  return <CategoryList categories={items} />;
}
