"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
// APOLLO
import { useQuery } from "../../../lib/hooks/useQuery";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { GET_MEMBER_FOLLOWINGS, GET_BRANDS } from "../../../../apollo/user/query";
import { UNSUBSCRIBE } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
// GLOBAL CUSTOM COMPONENTS
import { FlexBetween, FlexBox } from "components/flex-box";
import DashboardHeader from "pages-sections/customer-dashboard/dashboard-header";
import HeartLine from "icons/HeartLine";
// CUSTOM TYPES
import { T } from "../../../lib/types/common";

function resolveBrandImage(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

export default function FollowingPage() {
  const user = useReactiveVar(userVar);

  const { loading: followingsLoading, data: followingsData, refetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100, search: { followerId: user._id } } },
    notifyOnNetworkStatusChange: true,
    skip: !user._id,
  });

  const { loading: brandsLoading, data: brandsData } = useQuery(GET_BRANDS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100 } },
    notifyOnNetworkStatusChange: true,
  });

  const [unsubscribe] = useMutation(UNSUBSCRIBE);

  const followedBrands = useMemo(() => {
    const followingIds = new Set<string>(
      ((followingsData as T)?.getMemberFollowings?.list ?? []).map(
        (f: T) => (f.followingId as string)?.toString()
      )
    );
    const allBrands: T[] = (brandsData as T)?.getBrands?.brands ?? [];
    return allBrands.filter((b: T) => followingIds.has((b._id as string)?.toString()));
  }, [followingsData, brandsData]);

  const handleUnfollow = async (brandId: string) => {
    try {
      await unsubscribe({ variables: { input: brandId } });
      refetch();
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const isLoading = followingsLoading || brandsLoading;

  return (
    <Box>
      <DashboardHeader title="Following Brands" Icon={HeartLine} />

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid size={{ md: 4, sm: 6, xs: 12 }} key={i}>
              <Skeleton variant="rounded" height={100} />
            </Grid>
          ))}
        </Grid>
      ) : followedBrands.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            You haven&apos;t followed any brands yet.
          </Typography>
          <Link href="/brands">
            <Button variant="contained" color="primary">Explore Brands</Button>
          </Link>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {followedBrands.map((brand: T) => (
            <Grid size={{ md: 4, sm: 6, xs: 12 }} key={brand._id as string}>
              <Card
                elevation={0}
                sx={{ p: 2.5, border: "1px solid", borderColor: "grey.100", borderRadius: 2 }}
              >
                <FlexBetween gap={2}>
                  <Link href={`/brands/${brand._id}`} style={{ textDecoration: "none", flex: 1, minWidth: 0 }}>
                    <FlexBox alignItems="center" gap={1.5}>
                      {brand.brandLogo ? (
                        <Box sx={{ position: "relative", width: 52, height: 52, flexShrink: 0, borderRadius: 1, overflow: "hidden" }}>
                          <Image
                            src={resolveBrandImage(brand.brandLogo as string)}
                            alt={brand.brandName as string}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="52px"
                          />
                        </Box>
                      ) : (
                        <Avatar sx={{ width: 52, height: 52, bgcolor: "primary.main", flexShrink: 0 }}>
                          {(brand.brandName as string)?.[0]}
                        </Avatar>
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                        >
                          {brand.brandName as string}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(brand.brandFollowersCount as number) ?? 0} followers
                        </Typography>
                      </Box>
                    </FlexBox>
                  </Link>

                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleUnfollow((brand._id as string).toString())}
                    sx={{ flexShrink: 0, fontSize: 12 }}
                  >
                    Unfollow
                  </Button>
                </FlexBetween>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
