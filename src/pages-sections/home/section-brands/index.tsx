"use client";

import { useState } from "react";
import Link from "next/link";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { FlexBetween } from "components/flex-box";
import East from "@mui/icons-material/East";
import GroupIcon from "@mui/icons-material/Group";
import StarIcon from "@mui/icons-material/Star";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { Brand } from "../../../lib/types/Brand";
import { T } from "../../../lib/types/common";
import { FadeInCard } from "../../../components/scroll-reveal";

export default function FeaturedBrandsSection() {
  const [brands, setBrands] = useState<Brand[]>([]);

  /** APOLLO REQUESTS **/
  const {
    loading: getBrandsLoading,
    data: _getBrandsData,
    error: _getBrandsError,
    refetch: getBrandsRefetch,
  } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: { page: 1, limit: 6, search: {} },
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
          Featured Brands
        </Typography>
        <Link href="/brands" style={{ textDecoration: "none" }}>
          <Button endIcon={<East />} sx={{ fontWeight: 600, textTransform: "none" }}>
            View All Brands
          </Button>
        </Link>
      </FlexBetween>

      <Grid container spacing={3}>
        {getBrandsLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <Card sx={{ overflow: "hidden" }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent sx={{ py: 2 }}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="80%" height={20} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : brands.map((brand: Brand, i: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={brand._id}>
                <FadeInCard index={i}>
                  <Link
                    href={`/brands/${brand._id}`}
                    style={{ textDecoration: "none", display: "block", height: "100%" }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        overflow: "hidden",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: 4,
                        },
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
                        <Stack
                          alignItems="center"
                          justifyContent="center"
                          sx={{ height: 180, bgcolor: "grey.100" }}
                        >
                          <Avatar
                            alt={brand.brandName}
                            sx={{ width: 72, height: 72, fontSize: 28 }}
                          >
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
                </FadeInCard>
              </Grid>
            ))}
      </Grid>
    </Container>
  );
}
