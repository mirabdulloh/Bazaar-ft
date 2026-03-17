"use client";

import { PropsWithChildren } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
// LOCAL CUSTOM COMPONENTS
import BodyWrapper from "./dashboard-body-wrapper";
import DashboardNavbar from "./dashboard-navbar/dashboard-navbar";
import DashboardSidebar from "./dashboard-sidebar/dashboard-sidebar";
// LOCAL LAYOUT CONTEXT PROVIDER
import { LayoutProvider } from "./dashboard-layout-context";

export default function VendorDashboardLayout({ children }: PropsWithChildren) {
  return (
    <LayoutProvider>
      {/* DASHBOARD SIDEBAR NAVIGATION */}
      <DashboardSidebar />

      <BodyWrapper>
        {/* DASHBOARD HEADER / TOP BAR AREA */}
        <DashboardNavbar />

        {/* MAIN CONTENT AREA */}
        <Box component="main" sx={{ py: 3 }}>
          <Container maxWidth="lg" sx={{ pb: 4 }}>
            {children}
          </Container>
        </Box>
      </BodyWrapper>
    </LayoutProvider>
  );
}
