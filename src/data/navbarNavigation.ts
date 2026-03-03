import { Menu } from "models/Navigation.model";

// Seoulé MAIN NAVIGATION
const navbarNavigation: Menu[] = [
  {
    title: "Home",
    megaMenu: false,
    megaMenuWithSub: false,
    url: "/",
    child: []
  },
  {
    title: "Products",
    megaMenu: false,
    megaMenuWithSub: false,
    url: "/products/search",
    child: []
  },
  {
    title: "Brands",
    megaMenu: false,
    megaMenuWithSub: false,
    url: "/brands",
    child: []
  },
  {
    title: "Categories",
    megaMenu: false,
    megaMenuWithSub: false,
    child: [
      {
        title: "Men",
        child: [
          { title: "T-Shirts & Tops", url: "/products/search?category=men-tops" },
          { title: "Shirts", url: "/products/search?category=men-shirts" },
          { title: "Pants & Jeans", url: "/products/search?category=men-pants" },
          { title: "Jackets & Coats", url: "/products/search?category=men-outerwear" },
          { title: "Sportswear", url: "/products/search?category=men-sport" },
          { title: "Underwear & Socks", url: "/products/search?category=men-underwear" },
          { title: "Shoes & Sneakers", url: "/products/search?category=men-shoes" }
        ]
      },
      {
        title: "Women",
        child: [
          { title: "Dresses", url: "/products/search?category=women-dresses" },
          { title: "Tops & Blouses", url: "/products/search?category=women-tops" },
          { title: "Pants & Skirts", url: "/products/search?category=women-bottoms" },
          { title: "Jackets & Coats", url: "/products/search?category=women-outerwear" },
          { title: "Sportswear", url: "/products/search?category=women-sport" },
          { title: "Lingerie", url: "/products/search?category=women-lingerie" },
          { title: "Shoes & Heels", url: "/products/search?category=women-shoes" }
        ]
      },
      {
        title: "Accessories",
        child: [
          { title: "Bags & Backpacks", url: "/products/search?category=bags" },
          { title: "Hats & Caps", url: "/products/search?category=hats" },
          { title: "Belts", url: "/products/search?category=belts" },
          { title: "Sunglasses", url: "/products/search?category=sunglasses" },
          { title: "Watches", url: "/products/search?category=watches" },
          { title: "Jewelry", url: "/products/search?category=jewelry" },
          { title: "Scarves", url: "/products/search?category=scarves" }
        ]
      }
    ]
  },
  {
    title: "Sale",
    megaMenu: false,
    megaMenuWithSub: false,
    url: "/products/search?sale=true",
    child: []
  },
  {
    title: "Community",
    megaMenu: false,
    megaMenuWithSub: false,
    url: "/community",
    child: []
  },
  {
    title: "CS",
    megaMenu: false,
    megaMenuWithSub: false,
    child: [
      { title: "FAQ", url: "/faq" },
      { title: "Notices", url: "/notices" }
    ]
  }
];

export default navbarNavigation;
