"use client";

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { useTranslation } from "../react-i18next";
// LOCAL CUSTOM COMPONENT
import Card from "./card";
import CardTwo from "./card-2";
import CardThree from "./card-3";

export default function Section4() {
  const { t } = useTranslation();

  return (
    <Container className="mb-5">
      <Grid container spacing={3}>
        <Grid container spacing={3} size={{ md: 6, xs: 12 }}>
          <Grid size={12} sx={{ display: { xs: "none", md: "block" } }}>
            <Card
              title={t("Accessories to elevate every outfit.", {
                defaultValue: "Accessories to elevate every outfit."
              })}
              imgUrl="/assets/images/banners/banner-71-hq.jpg"
              href="/products/search?categoryName=Accessories"
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <CardTwo
              title={t("BAGS & BACKPACKS", { defaultValue: "BAGS & BACKPACKS" })}
              body={t("Carry your style everywhere.", { defaultValue: "Carry your style everywhere." })}
              imgUrl="/assets/images/banners/banner-72-hq.jpg"
              href="/products/search?categoryName=Bags"
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <CardTwo
              title={t("TOPS & SHIRTS", { defaultValue: "TOPS & SHIRTS" })}
              body={t("Fresh styles from top brands.", { defaultValue: "Fresh styles from top brands." })}
              imgUrl="/assets/images/banners/banner-73-hq.jpg"
              href="/products/search?categoryName=Clothing"
            />
          </Grid>
        </Grid>

        <Grid size={{ md: 6, xs: 12 }} sx={{ display: { xs: "none", md: "block" } }}>
          <CardThree
            title={t("OUTERWEAR", { defaultValue: "OUTERWEAR" })}
            imgUrl="/assets/images/banners/banner-74-hq.jpg"
            href="/products/search?categoryName=Clothing"
            body={t(
              "Layer up with the season's finest jackets and coats. Shop curated outerwear from BAZAAR brands.",
              {
                defaultValue:
                  "Layer up with the season's finest jackets and coats. Shop curated outerwear from BAZAAR brands."
              }
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
