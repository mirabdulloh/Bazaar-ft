"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// CUSTOM COMPONENTS
import NavItem from "./nav-item";
// AUTH
import { logOut } from "lib/auth";
// STYLED COMPONENTS
import { MainContainer } from "./styles";

export const MENUS = [
  {
    title: "DASHBOARD",
    list: [
      { icon: "Packages", href: "/orders", title: "Orders" },
      { icon: "HeartLine", href: "/wish-list", title: "Wishlist" },
      { icon: "BellOutlined", href: "/notifications", title: "Notifications" },
      { icon: "HeartLine", href: "/following", title: "Following Brands" }
    ]
  },
  {
    title: "ACCOUNT SETTINGS",
    list: [
      { icon: "User3", href: "/profile", title: "Profile Info" },
      { icon: "Location", href: "/address", title: "Addresses" },
      { icon: "CreditCard", href: "/payment-methods", title: "Payment Methods" }
    ]
  }
];

export function Navigation() {
  return (
    <MainContainer>
      {MENUS.map((item) => (
        <Box mt={2} key={item.title}>
          <Typography
            fontSize={12}
            variant="body1"
            fontWeight={500}
            color="text.secondary"
            textTransform="uppercase"
            sx={{ padding: ".75rem 1.75rem" }}
          >
            {item.title}
          </Typography>

          {item.list.map((listItem) => (
            <NavItem item={listItem} key={listItem.title} />
          ))}
        </Box>
      ))}

      <Box px={4} mt={6} pb={2}>
        <Button
          disableElevation
          variant="outlined"
          color="primary"
          fullWidth
          onClick={logOut}
        >
          Logout
        </Button>
      </Box>
    </MainContainer>
  );
}
