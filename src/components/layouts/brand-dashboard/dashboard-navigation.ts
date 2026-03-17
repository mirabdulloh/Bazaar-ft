import duotone from "icons/duotone";

export const adminNavigation = [
  { type: "label", label: "Admin" },
  {
    name: "Dashboard",
    icon: duotone.Dashboard,
    path: "/admin/dashboard"
  },
  {
    name: "Members",
    icon: duotone.Apps,
    children: [
      { name: "Brand List", path: "/admin/brands" },
      { name: "Users", path: "/admin/customers" }
    ]
  },
  {
    name: "Products",
    icon: duotone.Products,
    children: [
      { name: "Product List", path: "/admin/products" },
      { name: "Create Product", path: "/admin/products/create" },
      { name: "Product Reviews", path: "/admin/products/reviews" }
    ]
  },
  {
    name: "Categories",
    icon: duotone.Accounts,
    children: [
      { name: "Category List", path: "/admin/categories" },
      { name: "Create Category", path: "/admin/categories/create" }
    ]
  },
  {
    name: "Orders",
    icon: duotone.Order,
    path: "/admin/orders"
  },
  {
    name: "Notices",
    icon: duotone.Pages,
    path: "/admin/notices"
  },
  {
    name: "FAQs",
    icon: duotone.TodoList,
    path: "/admin/faqs"
  },
  {
    name: "Coupons",
    icon: duotone.Invoice,
    path: "/admin/coupons"
  },
  {
    name: "Articles",
    icon: duotone.Pages,
    path: "/admin/articles"
  },
  {
    name: "Chats",
    icon: duotone.Chat,
    path: "/admin/chats"
  },
  {
    name: "Messages",
    icon: duotone.Chat,
    path: "/admin/messages"
  },
  {
    name: "Addresses",
    icon: duotone.UserProfile,
    path: "/admin/addresses"
  },
  {
    name: "Notifications",
    icon: duotone.ProjectChart,
    path: "/admin/notifications"
  },
  {
    name: "Logout",
    icon: duotone.Session,
    path: "/",
    type: "logout"
  }
];

export const brandNavigation = [
  { type: "label", label: "Brand" },
  {
    name: "Dashboard",
    icon: duotone.Dashboard,
    path: "/brand/dashboard"
  },
  {
    name: "Products",
    icon: duotone.Products,
    children: [
      { name: "My Products", path: "/brand/products" },
      { name: "Add Product", path: "/brand/products/create" }
    ]
  },
  {
    name: "Orders",
    icon: duotone.Order,
    path: "/brand/orders"
  },
  {
    name: "Chats",
    icon: duotone.Chat,
    path: "/brand/chats"
  },
  {
    name: "Coupons",
    icon: duotone.Invoice,
    path: "/brand/coupons"
  },
  {
    name: "Reviews",
    icon: duotone.Review,
    path: "/brand/reviews"
  },
  {
    name: "Account Settings",
    icon: duotone.AccountSetting,
    path: "/brand/account-settings"
  },
  {
    name: "Logout",
    icon: duotone.Session,
    path: "/",
    type: "logout"
  }
];

// kept for any legacy imports
export const navigation = adminNavigation;
