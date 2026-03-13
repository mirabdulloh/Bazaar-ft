import { CategoryMenuItem } from "models/Category.model";

// BAZAAR category sidebar menu (secondary header dropdown)
export const categoryMenus: CategoryMenuItem[] = [
  {
    icon: "ShirtLine",
    title: "Men",
    href: "/products/search?gender=men",
    component: "Grid",
    children: [
      {
        title: "Tops",
        href: "#",
        children: [
          { title: "T-Shirts", href: "/products/search?category=men-tshirts" },
          { title: "Shirts", href: "/products/search?category=men-shirts" },
          { title: "Hoodies", href: "/products/search?category=men-hoodies" },
          { title: "Polo", href: "/products/search?category=men-polo" }
        ]
      },
      {
        title: "Bottoms",
        href: "#",
        children: [
          { title: "Jeans", href: "/products/search?category=men-jeans" },
          { title: "Trousers", href: "/products/search?category=men-trousers" },
          { title: "Shorts", href: "/products/search?category=men-shorts" },
          { title: "Joggers", href: "/products/search?category=men-joggers" }
        ]
      },
      {
        title: "Outerwear",
        href: "#",
        children: [
          { title: "Jackets", href: "/products/search?category=men-jackets" },
          { title: "Coats", href: "/products/search?category=men-coats" },
          { title: "Blazers", href: "/products/search?category=men-blazers" },
          { title: "Vests", href: "/products/search?category=men-vests" }
        ]
      },
      {
        title: "Shoes",
        href: "#",
        children: [
          { title: "Sneakers", href: "/products/search?category=men-sneakers" },
          { title: "Boots", href: "/products/search?category=men-boots" },
          { title: "Loafers", href: "/products/search?category=men-loafers" },
          { title: "Sandals", href: "/products/search?category=men-sandals" }
        ]
      }
    ]
  },
  {
    icon: "Woman",
    title: "Women",
    href: "/products/search?gender=women",
    component: "Grid",
    children: [
      {
        title: "Clothing",
        href: "#",
        children: [
          { title: "Dresses", href: "/products/search?category=women-dresses" },
          { title: "Tops & Blouses", href: "/products/search?category=women-tops" },
          { title: "Skirts", href: "/products/search?category=women-skirts" },
          { title: "Pants & Jeans", href: "/products/search?category=women-pants" }
        ]
      },
      {
        title: "Outerwear",
        href: "#",
        children: [
          { title: "Jackets & Coats", href: "/products/search?category=women-outerwear" },
          { title: "Blazers", href: "/products/search?category=women-blazers" },
          { title: "Hoodies", href: "/products/search?category=women-hoodies" },
          { title: "Vests", href: "/products/search?category=women-vests" }
        ]
      },
      {
        title: "Shoes",
        href: "#",
        children: [
          { title: "Heels", href: "/products/search?category=women-heels" },
          { title: "Sneakers", href: "/products/search?category=women-sneakers" },
          { title: "Boots", href: "/products/search?category=women-boots" },
          { title: "Flats & Sandals", href: "/products/search?category=women-flats" }
        ]
      },
      {
        title: "Lingerie & Sport",
        href: "#",
        children: [
          { title: "Lingerie", href: "/products/search?category=women-lingerie" },
          { title: "Sportswear", href: "/products/search?category=women-sport" },
          { title: "Swimwear", href: "/products/search?category=women-swimwear" },
          { title: "Sleepwear", href: "/products/search?category=women-sleepwear" }
        ]
      }
    ]
  },
  {
    icon: "BabyBoy",
    title: "Kids",
    href: "/products/search?gender=kids",
    component: "List",
    children: [
      { title: "Boys Tops", href: "/products/search?category=boys-tops" },
      { title: "Boys Bottoms", href: "/products/search?category=boys-bottoms" },
      { title: "Girls Dresses", href: "/products/search?category=girls-dresses" },
      { title: "Girls Tops", href: "/products/search?category=girls-tops" },
      { title: "Girls Bottoms", href: "/products/search?category=girls-bottoms" },
      { title: "Kids Shoes", href: "/products/search?category=kids-shoes" },
      { title: "Kids Outerwear", href: "/products/search?category=kids-outerwear" }
    ]
  },
  {
    icon: "GiftLine",
    title: "Accessories",
    href: "/products/search?category=accessories",
    component: "List",
    children: [
      { title: "Bags & Backpacks", href: "/products/search?category=bags" },
      { title: "Hats & Caps", href: "/products/search?category=hats" },
      { title: "Belts", href: "/products/search?category=belts" },
      { title: "Sunglasses", href: "/products/search?category=sunglasses" },
      { title: "Watches", href: "/products/search?category=watches" },
      { title: "Jewelry", href: "/products/search?category=jewelry" },
      { title: "Scarves", href: "/products/search?category=scarves" }
    ]
  }
];
