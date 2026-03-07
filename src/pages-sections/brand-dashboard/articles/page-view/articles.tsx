"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FlexBox from "components/flex-box/flex-box";

// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";

// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";

// LOCAL CUSTOM COMPONENT
import ArticleRow from "../article-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from "../../../../../apollo/admin/query";
import {
  UPDATE_BOARD_ARTICLE_BY_ADMIN,
  REMOVE_BOARD_ARTICLE_BY_ADMIN
} from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";

// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];
const CATEGORIES = ["FASHIONGUIDES", "TIPS", "REVIEW", "NEWS", "OTHER"];

// =============================================================================

export default function ArticlesPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const searchObj: any = {};
  if (statusFilter) searchObj.articleStatus = statusFilter;
  if (categoryFilter) searchObj.articleCategory = categoryFilter;

  const { data, loading, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(Object.keys(searchObj).length > 0 ? { search: searchObj } : {})
      }
    }
  });

  const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllBoardArticlesByAdmin?.list ?? [];
  const total = (data as T)?.getAllBoardArticlesByAdmin?.metaCounter?.total ?? 0;

  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await updateArticle({
        variables: { input: { _id: id, articleStatus: newStatus } }
      });
      await sweetTopSmallSuccessAlert(`Article ${newStatus.toLowerCase()}`);
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update article");
    }
  }, [updateArticle, refetch]);

  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await sweetConfirmAlert(
      "Remove Article?",
      "This article will be permanently removed.",
      "Remove"
    );
    if (!confirmed) return;

    try {
      await removeArticle({ variables: { input: id } });
      await sweetTopSmallSuccessAlert("Article removed");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to remove article");
    }
  }, [removeArticle, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Community Articles">
      {/* Filters */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading articles...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No articles found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((article: any) => (
                    <ArticleRow
                      key={article._id}
                      article={article}
                      onStatusChange={handleStatusChange}
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
