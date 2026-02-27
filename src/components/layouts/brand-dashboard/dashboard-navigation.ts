import duotone from "icons/duotone";

export const navigation = [
  { type: "label", label: "Admin" },
  {
    name: "Dashboard",
    icon: duotone.Dashboard,
    path: "/brand/dashboard"
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
    name: "Brands",
    icon: duotone.Apps,
    children: [
      { name: "Brand List", path: "/admin/brands" },
      { name: "Create Brand", path: "/admin/brands/create" }
    ]
  },
  {
    name: "Orders",
    icon: duotone.Order,
    children: [
      { name: "Order List", path: "/admin/orders" }
    ]
  },
  {
    name: "Customers",
    icon: duotone.Customers,
    path: "/admin/customers"
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
      { name: "Add Product", path: "/admin/products/create" }
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
    name: "Earnings",
    icon: duotone.ProjectChart,
    children: [
      { name: "Earning History", path: "/brand/earning-history" },
      { name: "Payouts", path: "/brand/payouts" },
      { name: "Payout Request", path: "/brand/payout-requests" },
      { name: "Payout Settings", path: "/brand/payout-settings" }
    ]
  },
  {
    name: "Refund Request",
    icon: duotone.Refund,
    path: "/brand/refund-request"
  },
  {
    name: "Reviews",
    icon: duotone.Review,
    path: "/brand/reviews"
  },
  {
    name: "Brand Settings",
    icon: duotone.SiteSetting,
    path: "/brand/shop-settings"
  },
  {
    name: "Account Settings",
    icon: duotone.AccountSetting,
    path: "/brand/account-settings"
  },
  {
    name: "Logout",
    icon: duotone.Session,
    path: "/"
  }
];
