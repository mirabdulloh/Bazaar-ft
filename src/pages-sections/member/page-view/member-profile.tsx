"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
// MUI
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// MUI ICONS
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// APOLLO
import { useReactiveVar, useMutation } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { useQuery } from "../../../lib/hooks/useQuery";
import {
  GET_MEMBER,
  GET_MEMBER_FOLLOWINGS,
  GET_MEMBER_FOLLOWERS
} from "../../../../apollo/user/query";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../../apollo/user/mutation";
// TYPES
import { T } from "../../../lib/types/common";
// UTILS
import { sweetTopSmallSuccessAlert, sweetTopSmallErrorAlert } from "../../../lib/sweetAlert";
import {
  DetailBadge,
  ProfileHeroCard,
  SectionCard,
  StatBox,
  TableHeader,
  TableRow,
  TableWrapper
} from "./styles";

// ─── Environment ──────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${API_URL}/${img}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = "followers" | "followings";

// ─── Component ────────────────────────────────────────────────────────────────
export default function MemberProfilePageView({ memberId }: { memberId: string }) {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activeTab, setActiveTab] = useState<TabType>("followers");
  const [page, setPage] = useState(1);
  const [memberLocal, setMemberLocal] = useState<T | null>(null);
  const [followingsLocal, setFollowingsLocal] = useState<T[] | null>(null);
  const [followersLocal, setFollowersLocal] = useState<T[] | null>(null);
  const [pendingFollowIds, setPendingFollowIds] = useState<Record<string, boolean>>({});
  const ITEMS_PER_PAGE = 6;

  const followersQueryVariables = useMemo(
    () => ({
      input: { page: 1, limit: 100, search: { followingId: memberId } }
    }),
    [memberId]
  );
  const followingsQueryVariables = useMemo(
    () => ({
      input: { page: 1, limit: 100, search: { followerId: memberId } }
    }),
    [memberId]
  );

  // ── Fetch target member ──
  const {
    loading: memberLoading,
    data: memberData,
    refetch: memberRefetch
  } = useQuery(GET_MEMBER, {
    variables: { input: memberId },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
    onCompleted: (data: T) => {
      setMemberLocal((data?.getMember as T) ?? {});
    }
  });

  const member: T = (memberData as T)?.getMember ?? {};

  // ── Fetch target member's followings ──
  const {
    loading: followingsLoading,
    data: followingsData,
    refetch: followingsRefetch
  } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: followingsQueryVariables,
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
    onCompleted: (data: T) => {
      setFollowingsLocal(((data?.getMemberFollowings as T)?.list as T[]) ?? []);
    }
  });

  // ── Fetch target member's followers ──
  const {
    loading: followersLoading,
    data: followersData,
    refetch: followersRefetch
  } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: followersQueryVariables,
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
    onCompleted: (data: T) => {
      setFollowersLocal(((data?.getMemberFollowers as T)?.list as T[]) ?? []);
    }
  });

  useEffect(() => {
    setMemberLocal(null);
    setFollowingsLocal(null);
    setFollowersLocal(null);
    setPendingFollowIds({});
    setPage(1);
  }, [memberId]);

  // ── Mutations ──
  const [subscribeMember] = useMutation(SUBSCRIBE);
  const [unsubscribeMember] = useMutation(UNSUBSCRIBE);

  const isTargetFollowed = useCallback(
    (targetId: string) => {
      const followerRow = followersLocal?.find(
        (row) => (((row.followerData as T) ?? {})._id as string) === targetId
      );
      if (followerRow) return !!(followerRow.meFollowed as T[])?.[0]?.myFollowing;
      const followingRow = followingsLocal?.find(
        (row) => (((row.followingData as T) ?? {})._id as string) === targetId
      );
      if (followingRow) return !!(followingRow.meFollowed as T[])?.[0]?.myFollowing;
      return false;
    },
    [followersLocal, followingsLocal]
  );

  const displayMember = memberLocal ?? member;
  const displayFollowers =
    followersLocal ?? (((followersData as T)?.getMemberFollowers as T)?.list as T[]) ?? [];
  const displayFollowings =
    followingsLocal ?? (((followingsData as T)?.getMemberFollowings as T)?.list as T[]) ?? [];
  const isFollowingMember = !!(displayMember?.meFollowed as T[])?.[0]?.myFollowing;

  const refetchFollowData = useCallback(async () => {
    const [memberResult, followersResult, followingsResult] = await Promise.all([
      memberRefetch({ input: memberId }),
      followersRefetch(followersQueryVariables),
      followingsRefetch(followingsQueryVariables)
    ]);

    setMemberLocal(((memberResult.data as T)?.getMember as T) ?? {});
    setFollowersLocal((((followersResult.data as T)?.getMemberFollowers as T)?.list as T[]) ?? []);
    setFollowingsLocal(
      (((followingsResult.data as T)?.getMemberFollowings as T)?.list as T[]) ?? []
    );
  }, [
    followingsQueryVariables,
    followingsRefetch,
    followersQueryVariables,
    followersRefetch,
    memberId,
    memberRefetch
  ]);

  const handleFollow = useCallback(
    async (targetId: string) => {
      if (pendingFollowIds[targetId] || isTargetFollowed(targetId)) return;
      try {
        setPendingFollowIds((prev) => ({ ...prev, [targetId]: true }));
        await subscribeMember({ variables: { input: targetId } });
        await refetchFollowData();
        sweetTopSmallSuccessAlert("Followed");
      } catch (err: any) {
        console.error("Follow error:", err);
        sweetTopSmallErrorAlert(err.message || "Failed to follow");
      } finally {
        setPendingFollowIds((prev) => ({ ...prev, [targetId]: false }));
      }
    },
    [isTargetFollowed, pendingFollowIds, refetchFollowData, subscribeMember]
  );

  const handleUnfollow = useCallback(
    async (targetId: string) => {
      if (pendingFollowIds[targetId] || !isTargetFollowed(targetId)) return;
      try {
        setPendingFollowIds((prev) => ({ ...prev, [targetId]: true }));
        await unsubscribeMember({ variables: { input: targetId } });
        await refetchFollowData();
        sweetTopSmallSuccessAlert("Unfollowed");
      } catch (err: any) {
        console.error("Unfollow error:", err);
        sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
      } finally {
        setPendingFollowIds((prev) => ({ ...prev, [targetId]: false }));
      }
    },
    [isTargetFollowed, pendingFollowIds, refetchFollowData, unsubscribeMember]
  );

  const handleFollowMember = useCallback(async () => {
    if (pendingFollowIds[memberId] || isFollowingMember) return;
    try {
      setPendingFollowIds((prev) => ({ ...prev, [memberId]: true }));
      await subscribeMember({ variables: { input: memberId } });
      await refetchFollowData();
      sweetTopSmallSuccessAlert("Followed");
    } catch (err: any) {
      console.error("Follow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to follow");
    } finally {
      setPendingFollowIds((prev) => ({ ...prev, [memberId]: false }));
    }
  }, [isFollowingMember, memberId, pendingFollowIds, refetchFollowData, subscribeMember]);

  const handleUnfollowMember = useCallback(async () => {
    if (pendingFollowIds[memberId] || !isFollowingMember) return;
    try {
      setPendingFollowIds((prev) => ({ ...prev, [memberId]: true }));
      await unsubscribeMember({ variables: { input: memberId } });
      await refetchFollowData();
      sweetTopSmallSuccessAlert("Unfollowed");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
    } finally {
      setPendingFollowIds((prev) => ({ ...prev, [memberId]: false }));
    }
  }, [isFollowingMember, memberId, pendingFollowIds, refetchFollowData, unsubscribeMember]);

  // ── Derived ──
  const memberType = displayMember.memberType as string;
  const isBrandOrAdmin = memberType === "BRAND" || memberType === "ADMIN";
  const people = activeTab === "followers" ? displayFollowers : displayFollowings;
  const dataKey = activeTab === "followers" ? "followerData" : "followingData";
  const isLoading =
    activeTab === "followers"
      ? followersLoading && displayFollowers.length === 0
      : followingsLoading && displayFollowings.length === 0;
  const totalPages = Math.max(1, Math.ceil(people.length / ITEMS_PER_PAGE));
  const paginated = people.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const memberImg =
    resolveImage(displayMember.memberImage as string) ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent((displayMember.memberNick as string) || "U")}`;

  // Reset page when switching tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ── Loading State ──
  if (memberLoading && !displayMember._id) {
    return (
      <Container sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!displayMember._id) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6" color="text.secondary">
          Member not found.
        </Typography>
      </Container>
    );
  }

  const handleNavigate = (fd: T) => {
    router.push(`/member/${fd._id}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{
          mb: { xs: 1.5, sm: 2 },
          textTransform: "none",
          color: "text.secondary",
          fontSize: { xs: 13, sm: 14 }
        }}
      >
        Back
      </Button>

      {/* ─── Hero Card ─── */}
      <ProfileHeroCard sx={{ mb: { xs: 2, sm: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "center", sm: "flex-start" }}
          spacing={3}
        >
          <Avatar
            src={memberImg}
            alt={displayMember.memberNick as string}
            sx={{
              width: { xs: 72, sm: 100 },
              height: { xs: 72, sm: 100 },
              border: "3px solid",
              borderColor: isBrandOrAdmin ? "primary.main" : "grey.300",
              flexShrink: 0
            }}
          />
          <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              justifyContent={{ xs: "center", sm: "flex-start" }}
              mb={0.5}
            >
              <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 18, sm: 24 } }}>
                {displayMember.memberNick as string}
              </Typography>
              {isBrandOrAdmin && (
                <Chip
                  label={memberType}
                  size="small"
                  color={memberType === "BRAND" ? "primary" : "info"}
                  sx={{ fontWeight: 600, fontSize: 11 }}
                />
              )}
            </Stack>

            {displayMember.memberFullName && (
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                {displayMember.memberFullName as string}
              </Typography>
            )}

            {displayMember.memberDesc && (
              <Typography variant="body2" color="text.secondary" mb={2} maxWidth={500}>
                {displayMember.memberDesc as string}
              </Typography>
            )}

            {/* Stats Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: isBrandOrAdmin ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                  sm: "repeat(auto-fit, minmax(90px, 1fr))"
                },
                gap: { xs: 1, sm: 2 },
                width: "100%"
              }}
            >
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>
                  {(displayMember.memberFollowers as number) ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: 10, sm: 12 } }}
                >
                  Followers
                </Typography>
              </StatBox>
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>
                  {(displayMember.memberFollowings as number) ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: 10, sm: 12 } }}
                >
                  Followings
                </Typography>
              </StatBox>
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>
                  {(displayMember.memberLikes as number) ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: 10, sm: 12 } }}
                >
                  Likes
                </Typography>
              </StatBox>
              {isBrandOrAdmin && (
                <>
                  <StatBox>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>
                      {(displayMember.memberArticles as number) ?? 0}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: { xs: 10, sm: 12 } }}
                    >
                      Articles
                    </Typography>
                  </StatBox>
                  {memberType === "BRAND" && (
                    <StatBox>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ fontSize: { xs: 16, sm: 20 } }}
                      >
                        {(displayMember.memberProducts as number) ?? 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: 10, sm: 12 } }}
                      >
                        Products
                      </Typography>
                    </StatBox>
                  )}
                </>
              )}
            </Box>

            {/* Follow/Unfollow button (don't show if it's the user themselves) */}
            {user?._id && user._id !== memberId && (
              <Box mt={2}>
                {isFollowingMember ? (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    disabled={!!pendingFollowIds[memberId]}
                    onClick={handleUnfollowMember}
                    sx={{ borderRadius: 5, textTransform: "none", fontWeight: 600, px: 3 }}
                  >
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    disabled={!!pendingFollowIds[memberId]}
                    onClick={handleFollowMember}
                    sx={{
                      borderRadius: 5,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      boxShadow: "none"
                    }}
                  >
                    Follow
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </ProfileHeroCard>

      {/* ─── Tabs ─── */}
      <Stack direction="row" spacing={1} mb={{ xs: 2, sm: 3 }}>
        {(["followers", "followings"] as TabType[]).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "contained" : "outlined"}
            size="small"
            onClick={() => setActiveTab(tab)}
            sx={{
              borderRadius: 5,
              textTransform: "none",
              fontWeight: 600,
              px: { xs: 2, sm: 3 },
              fontSize: { xs: 12, sm: 14 },
              boxShadow: "none",
              ...(activeTab === tab
                ? {
                    backgroundColor: "success.main",
                    color: "white",
                    "&:hover": { backgroundColor: "success.dark", boxShadow: "none" }
                  }
                : {
                    borderColor: "grey.300",
                    color: "text.secondary",
                    backgroundColor: "transparent",
                    "&:hover": { borderColor: "grey.400", backgroundColor: "grey.50" }
                  })
            }}
          >
            {tab === "followers"
              ? `Followers (${displayFollowers.length})`
              : `Followings (${displayFollowings.length})`}
          </Button>
        ))}
      </Stack>

      {/* ─── People Table ─── */}
      {isLoading ? (
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 2,
                px: 2.5,
                borderBottom: "1px solid",
                borderColor: "grey.100"
              }}
            >
              <Skeleton variant="circular" width={48} height={48} />
              <Box flex={1}>
                <Skeleton width={120} />
                <Skeleton width={200} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton width={80} height={36} variant="rounded" />
            </Box>
          ))}
        </Box>
      ) : people.length === 0 ? (
        <SectionCard sx={{ textAlign: "center", py: 5 }}>
          <PeopleAltOutlinedIcon sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            {activeTab === "followers" ? "No followers yet." : "Not following anyone yet."}
          </Typography>
        </SectionCard>
      ) : (
        <TableWrapper>
          <TableHeader>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Name
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Details
            </Typography>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.8}
              textAlign="right"
            >
              Subscription
            </Typography>
          </TableHeader>

          {/* Table body — grows to fill space */}
          <Box sx={{ flex: 1 }}>
            {paginated.map((f: T) => {
              const fd = (f[dataKey] as T) ?? {};
              const mt = fd.memberType as string;
              const fMemberImg = resolveImage(fd.memberImage as string);
              const fMemberId = fd._id as string;
              const fIsFollowing = !!(f.meFollowed as T[])?.[0]?.myFollowing;
              const fIsBrandOrAdmin = mt === "BRAND" || mt === "ADMIN";
              return (
                <TableRow key={f._id as string}>
                  {/* Name */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Avatar
                      src={fMemberImg}
                      alt={fd.memberNick as string}
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        cursor: "pointer",
                        border: fIsBrandOrAdmin ? "2px solid" : "none",
                        borderColor: mt === "BRAND" ? "primary.main" : "info.main"
                      }}
                      onClick={() => handleNavigate(fd)}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                          cursor: "pointer",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          fontSize: { xs: 13, sm: 14 },
                          "&:hover": { color: "primary.main" }
                        }}
                        onClick={() => handleNavigate(fd)}
                      >
                        {fd.memberNick as string}
                      </Typography>
                      {fIsBrandOrAdmin && (
                        <Chip
                          label={mt}
                          size="small"
                          color={mt === "BRAND" ? "primary" : "info"}
                          variant="outlined"
                          sx={{ fontSize: 9, height: 18, mt: 0.3 }}
                        />
                      )}
                    </Box>
                    {/* Mobile: Follow button inline with name */}
                    <Box sx={{ display: { xs: "flex", sm: "none" }, flexShrink: 0 }}>
                      {user?._id && user._id !== fMemberId ? (
                        fIsFollowing ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={!!pendingFollowIds[fMemberId]}
                            onClick={() => handleUnfollow(fMemberId)}
                            sx={{
                              borderRadius: 5,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: "none",
                              px: 1.5,
                              py: 0.2,
                              minWidth: 0
                            }}
                          >
                            Unfollow
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={!!pendingFollowIds[fMemberId]}
                            onClick={() => handleFollow(fMemberId)}
                            sx={{
                              borderRadius: 5,
                              fontSize: 10,
                              fontWeight: 600,
                              textTransform: "none",
                              px: 1.5,
                              py: 0.2,
                              minWidth: 0,
                              boxShadow: "none"
                            }}
                          >
                            Follow
                          </Button>
                        )
                      ) : null}
                    </Box>
                  </Box>

                  {/* Details */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap"
                    }}
                  >
                    <DetailBadge>
                      <PeopleAltOutlinedIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Followers ({(fd.memberFollowers as number) ?? 0})
                      </Typography>
                    </DetailBadge>
                    <DetailBadge>
                      <GroupsOutlinedIcon sx={{ fontSize: 15 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Followings ({(fd.memberFollowings as number) ?? 0})
                      </Typography>
                    </DetailBadge>
                    {fIsBrandOrAdmin && (
                      <DetailBadge>
                        <ArticleOutlinedIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" fontWeight={600}>
                          Articles ({(fd.memberArticles as number) ?? 0})
                        </Typography>
                      </DetailBadge>
                    )}
                    {mt === "BRAND" && (
                      <DetailBadge>
                        <StorefrontOutlinedIcon sx={{ fontSize: 15 }} />
                        <Typography variant="caption" fontWeight={600}>
                          Products ({(fd.memberProducts as number) ?? 0})
                        </Typography>
                      </DetailBadge>
                    )}
                  </Box>

                  {/* Subscription — desktop only (mobile is inline with name) */}
                  <Box
                    sx={{
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 1
                    }}
                  >
                    {user?._id && user._id !== fMemberId ? (
                      fIsFollowing ? (
                        <>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontStyle="italic"
                            sx={{ display: { xs: "none", sm: "block" } }}
                          >
                            Following
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={!!pendingFollowIds[fMemberId]}
                            onClick={() => handleUnfollow(fMemberId)}
                            sx={{
                              borderRadius: 5,
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "none",
                              px: 2,
                              py: 0.3,
                              minWidth: 0
                            }}
                          >
                            Unfollow
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={!!pendingFollowIds[fMemberId]}
                          onClick={() => handleFollow(fMemberId)}
                          sx={{
                            borderRadius: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            textTransform: "none",
                            px: 2.5,
                            py: 0.3,
                            minWidth: 0,
                            boxShadow: "none",
                            "&:hover": { boxShadow: "none" }
                          }}
                        >
                          Follow
                        </Button>
                      )
                    ) : null}
                  </Box>
                </TableRow>
              );
            })}
          </Box>

          {/* Pagination — pinned at bottom */}
          <Box sx={{ mt: "auto" }}>
            {totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 2,
                  gap: 1
                }}
              >
                <IconButton
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Box
                    key={p}
                    onClick={() => setPage(p)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                      ...(p === page
                        ? { backgroundColor: "success.main", color: "white" }
                        : { "&:hover": { backgroundColor: "grey.100" } })
                    }}
                  >
                    {p}
                  </Box>
                ))}
                <IconButton
                  size="small"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" textAlign="center" py={1.5}>
              {people.length} {activeTab === "followers" ? "followers" : "followings"}
            </Typography>
          </Box>
        </TableWrapper>
      )}
    </Container>
  );
}
