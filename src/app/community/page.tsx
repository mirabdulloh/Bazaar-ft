import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export const metadata: Metadata = {
  title: "Community - Seoulé",
  description: "Fashion articles, lookbooks, and style guides from Seoulé brands and creators.",
};

export default function CommunityPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h2" fontWeight={700} mb={1}>Community</Typography>
      <Typography variant="body1" color="text.secondary">
        Articles, lookbooks, and style inspiration — coming soon.
      </Typography>
    </Container>
  );
}
