"use client";

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { useTranslation } from "../../../../node_modules/react-i18next";
// LOCAL CUSTOM COMPONENTS
import Card from "./card";
import CardTwo from "./card-2";

export default function Section1() {
  const { t } = useTranslation();

  return (
    <Container className="pt-2 mb-4">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            badge={t("New Season Collection", { defaultValue: "New Season Collection" })}
            body={t("Discover the latest drops from independent brands.", {
              defaultValue: "Discover the latest drops from independent brands."
            })}
            title={t("Wear what makes you, you.", { defaultValue: "Wear what makes you, you." })}
            imgUrl="/assets/images/banners/banner-66.jpg"
            delay={220}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            badge={t("Exclusive Brands", { defaultValue: "Exclusive Brands" })}
            body={t("Shop curated looks from the best fashion brands.", {
              defaultValue: "Shop curated looks from the best fashion brands."
            })}
            title={t("The brands you love, all in one place.", {
              defaultValue: "The brands you love, all in one place."
            })}
            imgUrl="/assets/images/banners/banner-67.jpg"
            delay={340}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge={t("Men’s Essentials", { defaultValue: "Men’s Essentials" })}
            body={t("Clean cuts, premium materials.", { defaultValue: "Clean cuts, premium materials." })}
            title={t("Effortless style for every occasion", {
              defaultValue: "Effortless style for every occasion"
            })}
            imgUrl="/assets/images/banners/banner-68.jpg"
            delay={80}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge={t("Women’s Collection", { defaultValue: "Women’s Collection" })}
            body={t("From casual to bold — all seasons covered.", {
              defaultValue: "From casual to bold — all seasons covered."
            })}
            title={t("Dress the way you feel", { defaultValue: "Dress the way you feel" })}
            imgUrl="/assets/images/banners/banner-69.jpg"
            delay={460}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <CardTwo
            badge={t("Limited Deals", { defaultValue: "Limited Deals" })}
            body={t("Shop sale items before they’re gone.", {
              defaultValue: "Shop sale items before they’re gone."
            })}
            title={t("Up to 50% off selected brands", { defaultValue: "Up to 50% off selected brands" })}
            imgUrl="/assets/images/banners/banner-70.jpg"
            delay={580}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
