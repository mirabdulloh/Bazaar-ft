"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
// MUI
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
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
import { GET_MEMBER, GET_MEMBER_FOLLOWINGS, GET_MEMBER_FOLLOWERS } from "../../../../apollo/user/query";
import { SUBSCRIBE, UNSUBSCRIBE } from "../../../../apollo/user/mutation";
// TYPES
import { T } from "../../../lib/types/common";
// UTILS
import { sweetTopSmallSuccessAlert, sweetTopSmallErrorAlert } from "../../../lib/sweetAlert";
import { alpha, styled } from "@mui/material/styles";

// ─── Environment ──────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function resolveImage(img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  return `${API_URL}/${img}`;
}

// ─── Styled Components ───────────────────────────────────────────────────────
const ProfileHeroCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 16,
  boxShadow: "none",
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2.5, 2),
    borderRadius: 12,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: "center",
  padding: theme.spacing(2, 3),
  borderRadius: 12,
  border: `1px solid ${theme.palette.grey[100]}`,
  minWidth: 100,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1, 1.5),
    minWidth: 0,
    flex: 1,
    borderRadius: 8,
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  boxShadow: "none",
}));

const TableWrapper = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.grey[200]}`,
  borderRadius: 12,
  overflow: "hidden",
  minHeight: 520,
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.down("sm")]: {
    minHeight: 400,
    borderRadius: 10,
  },
}));

const TableHeader = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  padding: `${theme.spacing(1.5)} ${theme.spacing(2.5)}`,
  backgroundColor: theme.palette.grey[50],
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  [theme.breakpoints.down("sm")]: {
    display: "none",
  },
}));

const TableRow = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1.2fr) 2fr minmax(100px, 0.8fr)",
  alignItems: "center",
  padding: `${theme.spacing(2)} ${theme.spacing(2.5)}`,
  borderBottom: `1px solid ${theme.palette.grey[100]}`,
  transition: "background-color 0.15s ease",
  "&:last-child": { borderBottom: "none" },
  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.02) },
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(1.5),
    gridTemplateColumns: "unset",
  },
}));

const DetailBadge = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 13,
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

// ─── Types ────────────────────────────────────────────────────────────────────
type TabType = "followers" | "followings";

// ─── Component ────────────────────────────────────────────────────────────────
export default function MemberProfilePageView({ memberId }: { memberId: string }) {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [activeTab, setActiveTab] = useState<TabType>("followers");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // ── Fetch target member ──
  const { loading: memberLoading, data: memberData, refetch: memberRefetch } = useQuery(GET_MEMBER, {
    variables: { input: memberId },
    fetchPolicy: "cache-and-network",
    skip: !memberId,
  });

  const member: T = (memberData as T)?.getMember ?? {};

  // ── Fetch target member's followings ──
  const { loading: followingsLoading, data: followingsData, refetch: refetchFollowings } = useQuery(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100, search: { followerId: memberId } } },
    skip: !memberId,
  });

  // ── Fetch target member's followers ──
  const { loading: followersLoading, data: followersData, refetch: refetchFollowers } = useQuery(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: { page: 1, limit: 100, search: { followingId: memberId } } },
    skip: !memberId,
  });

  const followings: T[] = (followingsData as T)?.getMemberFollowings?.list ?? [];
  const followers: T[] = (followersData as T)?.getMemberFollowers?.list ?? [];
  const [followingsLocal, setFollowingsLocal] = useState<T[]>([]);
  const [followersLocal, setFollowersLocal] = useState<T[]>([]);

  const getRowId = (row: T, key: "followerData" | "followingData") => {
    const data = (row as T)[key] as T;
    return data?._id as string;
  };

  const sameListById = (a: T[], b: T[], key: "followerData" | "followingData") => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (getRowId(a[i], key) !== getRowId(b[i], key)) return false;
    }
    return true;
  };

  useEffect(() => {
    if (!sameListById(followingsLocal, followings, "followingData")) {
      setFollowingsLocal(followings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingsData]);

  useEffect(() => {
    if (!sameListById(followersLocal, followers, "followerData")) {
      setFollowersLocal(followers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followersData]);

  // Am I following this member? (from member query's meFollowed aggregation)
  const isFollowingMember = !!(member?.meFollowed as T[])?.[0]?.myFollowing;

  // ── Mutations ──
  const [subscribeMember] = useMutation(SUBSCRIBE);
  const [unsubscribeMember] = useMutation(UNSUBSCRIBE);

  const updateLocalFollow = useCallback((targetId: string, nextFollowing: boolean) => {
    const update = (list: T[]) =>
      list.map((row) => {
        const key = activeTab === "followers" ? "followerData" : "followingData";
        const member = (row as T)[key] as T;
        if ((member?._id as string) !== targetId) return row;
        return { ...row, meFollowed: [{ myFollowing: nextFollowing }] };
      });

    if (activeTab === "followers") {
      setFollowersLocal((prev) => update(prev));
    } else {
      setFollowingsLocal((prev) => update(prev));
    }
  }, [activeTab]);

  // Follow/unfollow within the table — update locally (no refetch)
  const handleFollow = useCallback(async (targetId: string) => {
    try {
      updateLocalFollow(targetId, true);
      await subscribeMember({ variables: { input: targetId } });
      sweetTopSmallSuccessAlert("Followed");
    } catch (err: any) {
      console.error("Follow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to follow");
    }
  }, [subscribeMember, updateLocalFollow]);

  const handleUnfollow = useCallback(async (targetId: string) => {
    try {
      updateLocalFollow(targetId, false);
      await unsubscribeMember({ variables: { input: targetId } });
      sweetTopSmallSuccessAlert("Unfollowed");
    } catch (err: any) {
      console.error("Unfollow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
    }
  }, [unsubscribeMember, updateLocalFollow]);

  // Follow/unfollow the member themselves (hero card button) — only refetch member
  const handleFollowMember = useCallback(async () => {
    try {
      await subscribeMember({ variables: { input: memberId } });
      sweetTopSmallSuccessAlert("Followed");
      memberRefetch();
    } catch (err: any) {
      console.error("Follow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to follow");
    }
  }, [subscribeMember, memberId, memberRefetch]);

  const handleUnfollowMember = useCallback(async () => {
    try {
      await unsubscribeMember({ variables: { input: memberId } });
      sweetTopSmallSuccessAlert("Unfollowed");
      memberRefetch();
    } catch (err: any) {
      console.error("Unfollow error:", err);
      sweetTopSmallErrorAlert(err.message || "Failed to unfollow");
    }
  }, [unsubscribeMember, memberId, memberRefetch]);

  // ── Derived ──
  const memberType = member.memberType as string;
  const isBrandOrAdmin = memberType === "BRAND" || memberType === "ADMIN";
  const people = activeTab === "followers" ? followersLocal : followingsLocal;
  const dataKey = activeTab === "followers" ? "followerData" : "followingData";
  const isLoading = activeTab === "followers" ? followersLoading : followingsLoading;
  const totalPages = Math.max(1, Math.ceil(people.length / ITEMS_PER_PAGE));
  const paginated = people.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const memberImg = resolveImage(member.memberImage as string) ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent((member.memberNick as string) || "U")}`;

  // Reset page when switching tabs
  useEffect(() => { setPage(1); }, [activeTab]);

  // ── Loading State ──
  if (memberLoading) {
    return (
      <Container sx={{ py: 6 }}>
        <Box display="flex" justifyContent="center" py={10}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!member._id) {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h6" color="text.secondary">Member not found.</Typography>
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
        sx={{ mb: { xs: 1.5, sm: 2 }, textTransform: "none", color: "text.secondary", fontSize: { xs: 13, sm: 14 } }}
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
            alt={member.memberNick as string}
            sx={{
              width: { xs: 72, sm: 100 },
              height: { xs: 72, sm: 100 },
              border: "3px solid",
              borderColor: isBrandOrAdmin ? "primary.main" : "grey.300",
              flexShrink: 0,
            }}
          />
          <Box flex={1} textAlign={{ xs: "center", sm: "left" }}>
            <Stack direction="row" alignItems="center" gap={1} justifyContent={{ xs: "center", sm: "flex-start" }} mb={0.5}>
              <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: 18, sm: 24 } }}>
                {member.memberNick as string}
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

            {member.memberFullName && (
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                {member.memberFullName as string}
              </Typography>
            )}

            {member.memberDesc && (
              <Typography variant="body2" color="text.secondary" mb={2} maxWidth={500}>
                {member.memberDesc as string}
              </Typography>
            )}

            {/* Stats Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: isBrandOrAdmin ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                  sm: "repeat(auto-fit, minmax(90px, 1fr))",
                },
                gap: { xs: 1, sm: 2 },
                width: "100%",
              }}
            >
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>{(member.memberFollowers as number) ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>Followers</Typography>
              </StatBox>
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>{(member.memberFollowings as number) ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>Followings</Typography>
              </StatBox>
              <StatBox>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>{(member.memberLikes as number) ?? 0}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>Likes</Typography>
              </StatBox>
              {isBrandOrAdmin && (
                <>
                  <StatBox>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>{(member.memberArticles as number) ?? 0}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>Articles</Typography>
                  </StatBox>
                  {memberType === "BRAND" && (
                    <StatBox>
                      <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: 16, sm: 20 } }}>{(member.memberProducts as number) ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: 10, sm: 12 } }}>Products</Typography>
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
                    onClick={handleFollowMember}
                    sx={{ borderRadius: 5, textTransform: "none", fontWeight: 600, px: 3, boxShadow: "none" }}
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
                    "&:hover": { backgroundColor: "success.dark", boxShadow: "none" },
                  }
                : {
                    borderColor: "grey.300",
                    color: "text.secondary",
                    backgroundColor: "transparent",
                    "&:hover": { borderColor: "grey.400", backgroundColor: "grey.50" },
                  }
              ),
            }}
          >
            {tab === "followers" ? `Followers (${followers.length})` : `Followings (${followings.length})`}
          </Button>
        ))}
      </Stack>

      {/* ─── People Table ─── */}
      {isLoading ? (
        <Box>
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, py: 2, px: 2.5, borderBottom: "1px solid", borderColor: "grey.100" }}>
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
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Name
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8}>
              Details
            </Typography>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.8} textAlign="right">
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
                      borderColor: mt === "BRAND" ? "primary.main" : "info.main",
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
                        "&:hover": { color: "primary.main" },
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
                          onClick={() => handleUnfollow(fMemberId)}
                          sx={{ borderRadius: 5, fontSize: 10, fontWeight: 600, textTransform: "none", px: 1.5, py: 0.2, minWidth: 0 }}
                        >
                          Unfollow
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleFollow(fMemberId)}
                          sx={{ borderRadius: 5, fontSize: 10, fontWeight: 600, textTransform: "none", px: 1.5, py: 0.2, minWidth: 0, boxShadow: "none" }}
                        >
                          Follow
                        </Button>
                      )
                    ) : null}
                  </Box>
                </Box>

                {/* Details */}
                <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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
                <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                  {user?._id && user._id !== fMemberId ? (
                    fIsFollowing ? (
                      <>
                        <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ display: { xs: "none", sm: "block" } }}>
                          Following
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleUnfollow(fMemberId)}
                          sx={{ borderRadius: 5, fontSize: 11, fontWeight: 600, textTransform: "none", px: 2, py: 0.3, minWidth: 0 }}
                        >
                          Unfollow
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleFollow(fMemberId)}
                        sx={{ borderRadius: 5, fontSize: 11, fontWeight: 600, textTransform: "none", px: 2.5, py: 0.3, minWidth: 0, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
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
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 2, gap: 1 }}>
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                        : { "&:hover": { backgroundColor: "grey.100" } }
                      ),
                    }}
                  >
                    {p}
                  </Box>
                ))}
                <IconButton size="small" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
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
