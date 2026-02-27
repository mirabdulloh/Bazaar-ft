import type { Metadata } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Seoulé Community`,
    description: "Read this article on Seoulé Community.",
  };
}

export default async function CommunityArticlePage({ params }: Props) {
  const { slug } = await params;
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700}>{slug.replace(/-/g, " ")}</Typography>
      <Typography variant="body1" color="text.secondary" mt={2}>
        Article content coming soon.
      </Typography>
    </Container>
  );
}
