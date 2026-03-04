import type { PropsWithChildren } from "react";
// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

export function CustomerDashboardLayout({ children }: PropsWithChildren) {
  return (
    <Box bgcolor="grey.50" py={{ xs: 3, sm: 4 }}>
      <Container>
        {children}
      </Container>
    </Box>
  );
}
