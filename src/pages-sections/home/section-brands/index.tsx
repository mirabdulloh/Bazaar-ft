"use client";

import { useState } from "react";
import { useTranslation } from "../../../../node_modules/react-i18next";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import East from "@mui/icons-material/East";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import { FlexBetween } from "components/flex-box";
import ProductsCarousel from "../section-3/products-carousel";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { Brand } from "../../../lib/types/Brand";
import { T } from "../../../lib/types/common";

export default function FeaturedBrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const { t } = useTranslation();

  /** APOLLO REQUESTS **/
  const {
    loading: getBrandsLoading,
    data: _getBrandsData,
    error: _getBrandsError,
    refetch: _getBrandsRefetch,
  } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: { page: 1, limit: 6, sort: "brandFollowersCount", direction: "DESC", search: {} },
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setBrands(data?.getBrands?.brands ?? []);
    },
  });

  return (
    <Container sx={{ mb: 6 }}>
      <FlexBetween mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t("Featured Brands", { defaultValue: "Featured Brands" })}
        </Typography>
        <Link href="/brands" style={{ textDecoration: "none" }}>
          <Button endIcon={<East />} sx={{ fontWeight: 600, textTransform: "none" }}>
            View All Brands
          </Button>
        </Link>
      </FlexBetween>

      {getBrandsLoading ? (
        <Box display="flex" gap={2} overflow="hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ minWidth: { xs: "75vw", sm: 280 }, flex: "0 0 auto" }}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" width="60%" sx={{ mt: 1 }} height={28} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          ))}
        </Box>
      ) : (
        <ProductsCarousel>
          {brands.map((brand: Brand) => (
            <Link
              key={brand._id}
              href={`/brands/${brand._id}`}
              style={{ textDecoration: "none", display: "block", height: "100%" }}
            >
              <Card
                sx={{
                  height: "100%",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
                }}
              >
                {brand.brandLogo ? (
                  <CardMedia
                    component="img"
                    height={180}
                    image={brand.brandLogo}
                    alt={brand.brandName}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 180, bgcolor: "grey.100" }}>
                    <Avatar alt={brand.brandName} sx={{ width: 72, height: 72, fontSize: 28 }}>
                      {brand.brandName?.[0]}
                    </Avatar>
                  </Stack>
                )}
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
                    {brand.brandName}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <GroupIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {brand.brandFollowersCount?.toLocaleString()} followers
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ fontSize: 14, color: "warning.main" }} />
                      <Typography variant="caption" color="text.secondary">
                        {brand.brandRating?.toFixed(1) ?? "—"}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Link>
          ))}
        </ProductsCarousel>
      )}
    </Container>
  );
}
