"use client";

import { useState, useCallback } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Divider from "@mui/material/Divider";
import Rating from "@mui/material/Rating";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// LOCAL CUSTOM COMPONENT
import ReviewRow from "../review-row";
import PageWrapper from "../../page-wrapper";
import { StatusWrapper } from "../../styles";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_REVIEWS_BY_ADMIN } from "../../../../../apollo/admin/query";
import {
  UPDATE_REVIEW_BY_ADMIN,
  REMOVE_REVIEW_BY_ADMIN
} from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";
import { format } from "date-fns/format";

// TABLE HEADING DATA LIST
const tableHeading = [
  { id: "productData", label: "Product", align: "left" },
  { id: "memberData", label: "Reviewer", align: "left" },
  { id: "reviewRating", label: "Rating", align: "left" },
  { id: "reviewStatus", label: "Status", align: "left" },
  { id: "createdAt", label: "Date", align: "left" },
  { id: "action", label: "Action", align: "center" }
];

const PAGE_SIZE = 20;
const REVIEW_STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function resolveImg(img?: string | null): string {
  if (!img || img === "null" || img === "undefined") return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

function getReviewData(result?: T) {
  return {
    rows: (result?.getAllReviewsByAdmin?.list ?? []).map(normalizeReviewRow),
    total: result?.getAllReviewsByAdmin?.metaCounter?.[0]?.total ?? 0
  };
}

function normalizeReviewRow(review: any) {
  return {
    ...review,
    productData: review?.productData ? { ...review.productData } : review?.productData ?? null,
    memberData: review?.memberData ? { ...review.memberData } : review?.memberData ?? null,
    orderItemData: review?.orderItemData ? { ...review.orderItemData } : review?.orderItemData ?? null,
    productDataSnapshot: review?.productData
      ? { ...review.productData }
      : review?.productDataSnapshot ?? null,
    memberDataSnapshot: review?.memberData
      ? { ...review.memberData }
      : review?.memberDataSnapshot ?? null,
    orderItemDataSnapshot: review?.orderItemData
      ? { ...review.orderItemData }
      : review?.orderItemDataSnapshot ?? null,
  };
}

function syncReviewStateFromQuery(
  result: T | undefined,
  setReviewRows: (rows: any[]) => void,
  setReviewTotal: (total: number) => void,
  selectedReview: any,
  setSelectedReview: (review: any | null) => void,
) {
  const { rows, total } = getReviewData(result);
  setReviewRows(rows);
  setReviewTotal(total);

  if (!selectedReview?._id) return;
  const refreshedSelectedReview = rows.find((item: any) => item._id === selectedReview._id) ?? null;
  setSelectedReview(refreshedSelectedReview);
}

// =============================================================================

export default function ProductReviewsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [reviewRows, setReviewRows] = useState<any[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { loading, error, refetch } = useQuery(GET_ALL_REVIEWS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(statusFilter ? { search: { reviewStatus: statusFilter } } : {})
      }
    },
    onCompleted: (result: T) => {
      const { rows, total } = getReviewData(result);
      setReviewRows(rows);
      setReviewTotal(total);
    },
  });

  const [updateReview] = useMutation(UPDATE_REVIEW_BY_ADMIN);
  const [removeReview] = useMutation(REMOVE_REVIEW_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: reviewRows, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusToggle = useCallback(async (review: any) => {
    if (review.reviewStatus === "DELETED") return;
    const newStatus = review.reviewStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateReview({
        variables: {
          input: { _id: review._id, reviewStatus: newStatus }
        }
      });
      const refreshed = await refetch();
      syncReviewStateFromQuery(
        refreshed.data as T,
        setReviewRows,
        setReviewTotal,
        selectedReview,
        setSelectedReview,
      );

      await sweetTopSmallSuccessAlert(`Review ${newStatus === "ACTIVE" ? "published" : "unpublished"}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update review");
    }
  }, [updateReview, refetch, selectedReview]);

  const handleDelete = useCallback(async (review: any) => {
    const isPermanentDelete = review.reviewStatus === "DELETED";
    const confirmed = await sweetConfirmAlert(
      isPermanentDelete ? "Delete Review?" : "Move Review To Deleted?",
      isPermanentDelete
        ? "This review will be permanently removed."
        : "This review will be hidden and marked as DELETED.",
      isPermanentDelete ? "Delete" : "Move"
    );
    if (!confirmed) return;

    try {
      if (isPermanentDelete) {
        await removeReview({ variables: { input: review._id } });
      } else {
        await updateReview({
          variables: {
            input: { _id: review._id, reviewStatus: "DELETED" }
          }
        });
      }
      const refreshed = await refetch();
      syncReviewStateFromQuery(
        refreshed.data as T,
        setReviewRows,
        setReviewTotal,
        selectedReview,
        setSelectedReview,
      );

      await sweetTopSmallSuccessAlert(isPermanentDelete ? "Review deleted" : "Review moved to deleted");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update review");
    }
  }, [removeReview, updateReview, refetch, selectedReview]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Product Reviews">
      {/* Filter */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {REVIEW_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading && reviewRows.length === 0 ? (
        <Typography variant="body1">Loading reviews...</Typography>
      ) : error && reviewRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load reviews
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : reviewRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No reviews found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 1000 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((review: any) => (
                    <ReviewRow
                      key={review._id}
                      review={review}
                      onView={setSelectedReview}
                      onToggle={handleStatusToggle}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.max(1, Math.ceil(reviewTotal / rowsPerPage))}
            />
          </Stack>
        </Card>
      )}

      <Dialog
        open={Boolean(selectedReview)}
        onClose={() => setSelectedReview(null)}
        fullWidth
        maxWidth="md"
      >
        {selectedReview ? (
          <>
            {(() => {
              const productData = selectedReview?.productData ?? selectedReview?.productDataSnapshot;
              const memberData = selectedReview?.memberData ?? selectedReview?.memberDataSnapshot;
              return (
                <>
            <DialogTitle sx={{ pb: 1 }}>
              Review Details
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={3}>
                <FlexBox
                  gap={2}
                  flexDirection={{ xs: "column", sm: "row" }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                >
                  <FlexBox alignItems="center" gap={1.5}>
                    {resolveImg(productData?.productImages?.[0]) ? (
                      <Avatar
                        variant="rounded"
                        src={resolveImg(productData?.productImages?.[0])}
                        alt={productData?.productTitle || "Product"}
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                        {(productData?.productTitle || "P")[0]}
                      </Avatar>
                    )}

                    <div>
                      <Typography variant="h6">
                        {productData?.productTitle || "Unknown Product"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Product #{productData?._id?.slice(0, 8) || "-"}
                      </Typography>
                    </div>
                  </FlexBox>

                  <Divider flexItem orientation="vertical" sx={{ display: { xs: "none", sm: "block" } }} />

                  <FlexBox alignItems="center" gap={1.5}>
                    {resolveImg(memberData?.memberImage) ? (
                      <Avatar
                        src={resolveImg(memberData?.memberImage)}
                        alt={memberData?.memberNick || "User"}
                        sx={{ width: 48, height: 48 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 48, height: 48, fontSize: 14, fontWeight: 700 }}>
                        {(memberData?.memberNick ||
                          memberData?.memberFullName ||
                          "U")
                          .slice(0, 2)
                          .toUpperCase()}
                      </Avatar>
                    )}

                    <div>
                      <Typography variant="h6">
                        {memberData?.memberNick ||
                          memberData?.memberFullName ||
                          "Unknown User"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {memberData?.memberEmail || "-"}
                      </Typography>
                    </div>
                  </FlexBox>
                </FlexBox>

                <FlexBox gap={1} flexWrap="wrap">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rating
                    </Typography>
                    <FlexBox alignItems="center" gap={1} mt={0.5}>
                      <Rating value={selectedReview?.reviewRating ?? 0} size="small" readOnly />
                      <Typography variant="h6">{selectedReview?.reviewRating ?? 0} / 5</Typography>
                    </FlexBox>
                  </Box>

                  <Box sx={{ ml: { sm: 4, xs: 0 } }}>
                    <Typography variant="body2" color="text.secondary">
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <StatusWrapper status={selectedReview?.reviewStatus || "INACTIVE"}>
                        {selectedReview?.reviewStatus || "-"}
                      </StatusWrapper>
                    </Box>
                  </Box>

                  <Box sx={{ ml: { sm: 4, xs: 0 } }}>
                    <Typography variant="body2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="h6">
                      {selectedReview?.createdAt
                        ? format(new Date(selectedReview.createdAt), "dd MMM yyyy")
                        : "-"}
                    </Typography>
                  </Box>
                </FlexBox>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Review
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.7,
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "grey.50"
                    }}
                  >
                    {selectedReview?.reviewComment || "-"}
                  </Typography>
                </Box>

                {selectedReview?.reviewImages?.length ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Review Images
                    </Typography>
                    <Box
                      sx={{
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: {
                          xs: "repeat(2, minmax(0, 1fr))",
                          sm: "repeat(3, minmax(0, 1fr))"
                        }
                      }}
                    >
                      {selectedReview.reviewImages.map((image: string, index: number) => {
                        const src = resolveImg(image);
                        return src ? (
                          <Box
                            key={`${selectedReview._id}-image-${index}`}
                            component="img"
                            src={src}
                            alt={`Review image ${index + 1}`}
                            sx={{
                              width: "100%",
                              height: 180,
                              objectFit: "cover",
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider"
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  </Box>
                ) : null}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setSelectedReview(null)}>Close</Button>
            </DialogActions>
                </>
              );
            })()}
          </>
        ) : null}
      </Dialog>
    </PageWrapper>
  );
}
