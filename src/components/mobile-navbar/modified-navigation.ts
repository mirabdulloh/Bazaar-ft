import { Menu } from "models/Navigation.model";
import { MenuItem } from "models/Navigation.model";

// MODIFY THE NAVIGATION WITH NEW STRUCTURE
export const updateNavigation = (navigation: Menu[], includeProfile = false) => {
  const withCsNormalized = navigation.map((item) => {
    if (item.title.trim().toLowerCase() !== "cs") return item;

    return {
      title: "CS",
      url: "/notices",
      megaMenu: false,
      megaMenuWithSub: false,
      child: []
    };
  });

  const exists = withCsNormalized.some((item) => item.title.trim().toLowerCase() === "cs");

  const csMenu: MenuItem = {
    title: "CS",
    url: "/notices",
    megaMenu: false,
    megaMenuWithSub: false,
    child: []
  };

  const merged = exists ? withCsNormalized : [...withCsNormalized, csMenu];

  const result = merged.map((curr) => {
    if (curr.megaMenu || curr.megaMenuWithSub) {
      const flatChild = curr.child.flat();
      return { title: curr.title, child: flatChild };
    }

    if (curr.child && curr.child.length > 0) {
      return { title: curr.title, child: curr.child };
    }

    if (curr.url) {
      return { title: curr.title, url: curr.url };
    }

    return { title: curr.title, child: [] };
  });

  if (includeProfile) {
    return [...result, { title: "My Profile", url: "/profile" }];
  }

  return result;
};
