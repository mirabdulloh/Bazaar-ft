import Link from "next/link";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import { FlexBetween } from "components/flex-box";
import East from "@mui/icons-material/East";

// Mock brand data — will be replaced with real API in Stage 2
const FEATURED_BRANDS = [
  { id: "1", name: "STUDIO K", slug: "studio-k", coverPicture: "/assets/images/banners/banner-66.jpg", tagline: "Contemporary Minimalism" },
  { id: "2", name: "ARKO", slug: "arko", coverPicture: "/assets/images/banners/banner-67.jpg", tagline: "Streetwear & Urban" },
  { id: "3", name: "VESNA", slug: "vesna", coverPicture: "/assets/images/banners/banner-68.jpg", tagline: "Sustainable Fashion" },
  { id: "4", name: "MODAL", slug: "modal", coverPicture: "/assets/images/banners/banner-69.jpg", tagline: "Premium Essentials" },
  { id: "5", name: "TEMPO", slug: "tempo", coverPicture: "/assets/images/banners/banner-70.jpg", tagline: "Athletic Lifestyle" },
  { id: "6", name: "NURI", slug: "nuri", coverPicture: "/assets/images/banners/banner-71.jpg", tagline: "Korean Street Style" },
];

export default function FeaturedBrandsSection() {
  return (
    <Container sx={{ mb: 6 }}>
      <FlexBetween mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Featured Brands
        </Typography>
        <Link href="/brands" style={{ textDecoration: "none" }}>
          <Button endIcon={<East />} sx={{ fontWeight: 600, textTransform: "none" }}>
            View All Brands
          </Button>
        </Link>
      </FlexBetween>

      <Grid container spacing={3}>
        {FEATURED_BRANDS.map((brand) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={brand.id}>
            <Link href={`/brands/${brand.slug}`} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height={180}
                  image={brand.coverPicture}
                  alt={brand.name}
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {brand.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {brand.tagline}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
