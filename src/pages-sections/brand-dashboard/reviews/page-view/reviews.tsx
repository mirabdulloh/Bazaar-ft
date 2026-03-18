"use client";

import { useApolloClient } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
import FlexBox from "components/flex-box/flex-box";
import useMuiTable from "hooks/useMuiTable";
import { useQuery } from "lib/hooks/useQuery";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";
import ReviewRow, { BrandReviewRowData } from "../review-row";
import { GET_BRAND_PRODUCTS } from "../../../../../apollo/brand/query";
import { GET_REVIEWS } from "../../../../../apollo/user/query";
import { T } from "lib/types/common";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

function resolveImage(img?: string | null): string {
  if (!img) return "";
  const value = img.trim().replace(/^['"]+|['"]+$/g, "");
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

export default function ReviewsPageView() {
  const client = useApolloClient();
  const [selectedReview, setSelectedReview] = useState<BrandReviewRowData | null>(null);
  const [reviewRows, setReviewRows] = useState<BrandReviewRowData[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<Error | null>(null);

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_BRAND_PRODUCTS, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        page: 1,
        limit: 200,
        sort: "createdAt",
        direction: "DESC",
        search: {},
      },
    },
  });

  const products = useMemo(
    () => ((productsData as T)?.getBrandProducts?.products ?? []),
    [productsData]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBrandReviews() {
      if (!products.length) {
        setReviewRows([]);
        return;
      }

      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const reviewsByProduct = await Promise.all(
          products.map(async (product: any) => {
            const allReviews: any[] = [];
            let page = 1;
            let total = 0;

            do {
              const { data } = await client.query({
                query: GET_REVIEWS,
                fetchPolicy: "network-only",
                variables: {
                  input: {
                    page,
                    limit: 100,
                    sort: "createdAt",
                    direction: "DESC",
                    search: {
                      productId: product._id,
                    },
                  },
                },
              });

              const list = (data as T)?.getReviews?.list ?? [];
              total = (data as T)?.getReviews?.metaCounter?.[0]?.total ?? 0;
              allReviews.push(...list);
              page += 1;
            } while (allReviews.length < total);

            return allReviews.map((review: any) => ({
              ...review,
              productTitle: product.productTitle ?? "Product",
              productImage: resolveImage(product.productImages?.[0]),
              memberData: {
                ...review.memberData,
                memberImage: resolveImage(review.memberData?.memberImage),
              },
              reviewImages: (review.reviewImages ?? []).map(resolveImage).filter(Boolean),
            }));
          })
        );

        if (!cancelled) {
          setReviewRows(reviewsByProduct.flat());
        }
      } catch (err: any) {
        if (!cancelled) {
          setReviewsError(err);
          setReviewRows([]);
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    void loadBrandReviews();

    return () => {
      cancelled = true;
    };
  }, [client, products]);

  const { page, order, orderBy, handleRequestSort, filteredList, rowsPerPage, handleChangePage } = useMuiTable({
    listData: reviewRows,
    defaultSort: "createdAt",
    defaultOrder: "desc",
  });

  return (
    <PageWrapper title="Product Reviews">
      <FlexBox mb={2} gap={2} flexWrap="wrap" justifyContent="space-between">
        <Typography color="text.secondary" sx={{ alignSelf: "center" }}>
          Brand can view reviews only. This page shows reviews across all of your products.
        </Typography>
      </FlexBox>

      {productsLoading ? (
        <Typography>Loading products...</Typography>
      ) : productsError ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>Failed to load products</Typography>
          <Typography color="text.secondary">{productsError.message}</Typography>
        </Card>
      ) : products.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No brand products found.</Typography>
        </Card>
      ) : reviewsLoading && reviewRows.length === 0 ? (
        <Typography>Loading reviews...</Typography>
      ) : reviewsError ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error.main" sx={{ mb: 1 }}>Failed to load reviews</Typography>
          <Typography color="text.secondary">{reviewsError.message}</Typography>
        </Card>
      ) : reviewRows.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No reviews found for your products.</Typography>
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
                  {filteredList.map((review) => (
                    <ReviewRow review={review} key={review._id} onView={setSelectedReview} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              page={page + 1}
              onChange={handleChangePage}
              count={Math.max(1, Math.ceil(reviewRows.length / rowsPerPage))}
            />
          </Stack>
        </Card>
      )}

      <Dialog open={!!selectedReview} onClose={() => setSelectedReview(null)} maxWidth="md" fullWidth>
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent dividers>
          {selectedReview ? (
            <Stack spacing={3}>
              <FlexBox alignItems="center" gap={2}>
                <Avatar
                  variant="rounded"
                  src={selectedReview.productImage || undefined}
                  alt={selectedReview.productTitle}
                  sx={{ width: 72, height: 72 }}
                >
                  {selectedReview.productTitle?.slice(0, 1)?.toUpperCase() || "P"}
                </Avatar>

                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    {selectedReview.productTitle}
                  </Typography>
                  <Typography color="text.secondary">
                    Reviewer: {selectedReview.memberData?.memberNick || "-"}
                  </Typography>
                  <FlexBox alignItems="center" gap={1} sx={{ mt: 0.75 }}>
                    <Rating value={selectedReview.reviewRating ?? 0} size="small" readOnly />
                    <Typography>{selectedReview.reviewRating ?? 0} / 5</Typography>
                  </FlexBox>
                </Box>
              </FlexBox>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Review
                </Typography>
                <Typography whiteSpace="pre-line">{selectedReview.reviewComment || "-"}</Typography>
              </Box>

              {selectedReview.reviewImages?.length ? (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Review Images
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedReview.reviewImages.map((image, index) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${image}-${index}`}>
                        <Box
                          component="img"
                          src={image}
                          alt={`Review ${index + 1}`}
                          sx={{
                            width: "100%",
                            height: 220,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "block",
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
