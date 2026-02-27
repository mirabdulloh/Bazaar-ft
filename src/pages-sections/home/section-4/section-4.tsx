import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
// LOCAL CUSTOM COMPONENT
import Card from "./card";
import CardTwo from "./card-2";
import CardThree from "./card-3";

export default function Section4() {
  return (
    <Container className="mb-5">
      <Grid container spacing={3}>
        <Grid container spacing={3} size={{ md: 6, xs: 12 }}>
          <Grid size={12}>
            <Card
              title="Accessories to elevate every outfit."
              imgUrl="/assets/images/banners/banner-71.jpg"
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <CardTwo
              title="BAGS & BACKPACKS"
              body="Carry your style everywhere."
              imgUrl="/assets/images/banners/banner-72.jpg"
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <CardTwo
              title="TOPS & SHIRTS"
              body="Fresh styles from top brands."
              imgUrl="/assets/images/banners/banner-73.jpg"
            />
          </Grid>
        </Grid>

        <Grid size={{ md: 6, xs: 12 }}>
          <CardThree
            title="OUTERWEAR"
            imgUrl="/assets/images/banners/banner-74.jpg"
            body="Layer up with the season's finest jackets and coats. Shop curated outerwear from Seoulé brands."
          />
        </Grid>
      </Grid>
    </Container>
  );
}
