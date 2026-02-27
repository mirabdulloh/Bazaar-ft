import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export const metadata: Metadata = {
  title: "Notices - Seoulé",
  description: "Latest announcements and platform notices from Seoulé.",
};

export default function NoticesPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h2" fontWeight={700} mb={1}>Notices</Typography>
      <Typography variant="body1" color="text.secondary">
        Platform announcements coming soon.
      </Typography>
    </Container>
  );
}
