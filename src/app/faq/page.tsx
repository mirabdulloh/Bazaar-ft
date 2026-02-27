import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export const metadata: Metadata = {
  title: "FAQ - Seoulé",
  description: "Frequently asked questions about shopping on Seoulé.",
};

export default function FaqPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h2" fontWeight={700} mb={1}>Frequently Asked Questions</Typography>
      <Typography variant="body1" color="text.secondary">
        FAQ content coming soon.
      </Typography>
    </Container>
  );
}
