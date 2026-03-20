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
import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import Link from "next/link";
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
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [articleRows, setArticleRows] = useState<any[]>([]);
  const [articleTotal, setArticleTotal] = useState(0);

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const searchObj: any = {};
  if (statusFilter) searchObj.articleStatus = statusFilter;
  if (categoryFilter) searchObj.articleCategory = categoryFilter;

  const { loading, error, refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
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
    },
    onCompleted: (result: T) => {
      setArticleRows(result?.getAllBoardArticlesByAdmin?.list ?? []);
      setArticleTotal(result?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0);
    },
  });

  const [updateArticle] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
  const [removeArticle] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: articleRows, defaultSort: "createdAt", defaultOrder: "desc" });

  const syncArticleState = useCallback((result: T | undefined) => {
    setArticleRows(result?.getAllBoardArticlesByAdmin?.list ?? []);
    setArticleTotal(result?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0);
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    try {
      await updateArticle({
        variables: { input: { _id: id, articleStatus: newStatus } }
      });
      const refreshed = await refetch();
      syncArticleState(refreshed.data as T);
      await sweetTopSmallSuccessAlert(`Article ${newStatus.toLowerCase()}`);
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update article");
    }
  }, [updateArticle, refetch, syncArticleState]);

  const handleDelete = useCallback(async (article: any) => {
    if (article.articleStatus !== "INACTIVE") {
      await sweetMixinErrorAlert(
        "This article cannot be permanently removed yet. Change its status to INACTIVE first, then remove it."
      );
      return;
    }

    const confirmed = await sweetConfirmAlert(
      "Remove Article?",
      "This article will be permanently removed.",
      "Remove"
    );
    if (!confirmed) return;

    try {
      await removeArticle({ variables: { input: article._id } });
      const refreshed = await refetch();
      syncArticleState(refreshed.data as T);
      await sweetTopSmallSuccessAlert("Article removed");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to remove article");
    }
  }, [removeArticle, refetch, syncArticleState]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Community Articles">
      {/* Filters */}
      <FlexBox mb={2} gap={2} justifyContent="space-between" flexWrap="wrap">
        <FlexBox gap={2} flexWrap="wrap">
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

        <Link href="/admin/articles/create">
          <Button
            color="info"
            fullWidth={downSM}
            variant="contained"
            startIcon={<Add />}
            sx={{ minHeight: 44 }}
          >
            Write Article
          </Button>
        </Link>
      </FlexBox>

      {loading && articleRows.length === 0 ? (
        <Typography variant="body1">Loading articles...</Typography>
      ) : error && articleRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>
            Failed to load articles
          </Typography>
          <Typography color="text.secondary">{error.message}</Typography>
        </Card>
      ) : articleRows.length === 0 ? (
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
              count={Math.max(1, Math.ceil(articleTotal / rowsPerPage))}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
