import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
// LOCAL CUSTOM COMPONENTS
import Card from "./card";
import CardTwo from "./card-2";

export default function Section1() {
  return (
    <Container className="pt-2 mb-4">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            badge="New Season Collection"
            body="Discover the latest drops from independent brands."
            title="Wear what makes you, you."
            imgUrl="/assets/images/banners/banner-66.jpg"
            delay={220}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            badge="Exclusive Brands"
            body="Shop curated looks from the best fashion brands."
            title="The brands you love, all in one place."
            imgUrl="/assets/images/banners/banner-67.jpg"
            delay={340}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge="Men’s Essentials"
            body="Clean cuts, premium materials."
            title="Effortless style for every occasion"
            imgUrl="/assets/images/banners/banner-68.jpg"
            delay={80}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge="Women’s Collection"
            body="From casual to bold — all seasons covered."
            title="Dress the way you feel"
            imgUrl="/assets/images/banners/banner-69.jpg"
            delay={460}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge="Limited Deals"
            body="Shop sale items before they’re gone."
            title="Up to 50% off selected brands"
            imgUrl="/assets/images/banners/banner-70.jpg"
            delay={580}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
