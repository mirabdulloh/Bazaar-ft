"use client";

import { useMemo } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Theme } from "@mui/material/styles";
import Link from "next/link";
import { useReactiveVar } from "@apollo/client/react";
import FlexBox from "components/flex-box/flex-box";
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import useMuiTable from "hooks/useMuiTable";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";
import BrandArticleRow from "../brand-article-row";
import { GET_BOARD_ARTICLES } from "../../../../../apollo/user/query";
import { userVar } from "../../../../../apollo/store";
import { useQuery } from "lib/hooks/useQuery";
import { T } from "lib/types/common";

const PAGE_SIZE = 20;

export default function BrandArticlesPageView() {
  const user = useReactiveVar(userVar);
  const downSM = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const { data, loading, error } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    skip: !user?._id,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: {
          memberId: user?._id
        }
      }
    }
  });

  const articleRows = useMemo(() => {
    return ((data as T)?.getBoardArticles?.list ?? []) as any[];
  }, [data]);

  const articleTotal = useMemo(() => {
    return ((data as T)?.getBoardArticles?.metaCounter?.[0]?.total ?? 0) as number;
  }, [data]);

  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: articleRows, defaultSort: "createdAt", defaultOrder: "desc" });

  return (
    <PageWrapper title="My Articles">
      <FlexBox mb={2} justifyContent="flex-end" flexWrap="wrap">
        <Link href="/brand/articles/create">
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
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            You have not published any articles yet.
          </Typography>
          <Typography color="text.secondary">
            Write your first article to share updates, reviews, or brand stories.
          </Typography>
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
                    <BrandArticleRow key={article._id} article={article} />
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
