"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
// LOCAL CUSTOM COMPONENT
import ReviewRow from "../review-row";
import PageWrapper from "../../page-wrapper";
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

// TABLE HEADING DATA LIST
const tableHeading = [
  { id: "reviewComment", label: "Review", align: "left" },
  { id: "reviewRating", label: "Rating", align: "left" },
  { id: "reviewStatus", label: "Status", align: "left" },
  { id: "createdAt", label: "Date", align: "left" },
  { id: "action", label: "Action", align: "center" }
];

const PAGE_SIZE = 20;
const REVIEW_STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];

// =============================================================================

export default function ProductReviewsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const { data, loading, refetch } = useQuery(GET_ALL_REVIEWS_BY_ADMIN, {
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
    }
  });

  const [updateReview] = useMutation(UPDATE_REVIEW_BY_ADMIN);
  const [removeReview] = useMutation(REMOVE_REVIEW_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllReviewsByAdmin?.list ?? [];
  const total = (data as T)?.getAllReviewsByAdmin?.metaCounter?.total ?? 0;

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusToggle = useCallback(async (review: any) => {
    const newStatus = review.reviewStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateReview({
        variables: {
          input: { _id: review._id, reviewStatus: newStatus }
        }
      });
      await sweetTopSmallSuccessAlert(`Review ${newStatus === "ACTIVE" ? "published" : "unpublished"}`);
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update review");
    }
  }, [updateReview, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await sweetConfirmAlert(
      "Delete Review?",
      "This review will be permanently removed.",
      "Delete"
    );
    if (!confirmed) return;

    try {
      await removeReview({ variables: { input: id } });
      await sweetTopSmallSuccessAlert("Review deleted");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to delete review");
    }
  }, [removeReview, refetch]);

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

      {loading ? (
        <Typography variant="body1">Loading reviews...</Typography>
      ) : list.length === 0 ? (
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
              count={Math.ceil(total / rowsPerPage)}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
