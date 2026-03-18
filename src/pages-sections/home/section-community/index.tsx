"use client";

import { useState } from "react";
import { useTranslation } from "../../../../node_modules/react-i18next";
import Link from "next/link";
import Image from "next/image";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { FadeInCard } from "../../../components/scroll-reveal";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_BOARD_ARTICLES } from "../../../../apollo/user/query";
import { T } from "../../../lib/types/common";

interface GqlArticle {
  _id: string;
  articleTitle: string;
  articleCategory: string;
  articleImages: string[];
  createdAt: string;
  memberData?: {
    _id: string;
    memberNick: string;
    memberImage: string;
  };
}

const resolveArticleAsset = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return apiBase ? `${apiBase}${normalized}` : normalized;
};

export default function SectionCommunity() {
  const [articles, setArticles] = useState<GqlArticle[]>([]);
  const { t } = useTranslation();

  /** APOLLO REQUESTS **/
  const {
    loading: getArticlesLoading,
    data: _getArticlesData,
    error: _getArticlesError,
    refetch: getArticlesRefetch,
  } = useQuery(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 3,
        sort: "createdAt",
        direction: "DESC",
        search: {},
      },
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setArticles(data?.getBoardArticles?.list ?? []);
    },
  });

  return (
    <Container sx={{ py: 5 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t("Latest from Community", { defaultValue: "Latest from Community" })}
        </Typography>
        <Link href="/community" style={{ textDecoration: "none" }}>
          <Typography variant="body2" color="primary" fontWeight={600}>
            See All
          </Typography>
        </Link>
      </Box>

      <Grid container spacing={3}>
        {getArticlesLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))
          : articles.map((article, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={article._id}>
                <FadeInCard index={i}>
                  <Link href={`/community/${article._id}`} style={{ textDecoration: "none" }}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: 1,
                        transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: 4 },
                        height: "100%",
                      }}
                    >
                      {/* Article image */}
                      <Box
                        sx={{
                          position: "relative",
                          height: 200,
                          backgroundColor: "grey.100",
                          borderRadius: "12px 12px 0 0",
                          overflow: "hidden",
                        }}
                      >
                        {resolveArticleAsset(article.articleImages?.[0]) ? (
                          <Image
                            fill
                            alt={article.articleTitle}
                            src={resolveArticleAsset(article.articleImages?.[0])}
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                          />
                        )}
                      </Box>

                      <CardContent>
                        <Chip
                          label={article.articleCategory}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mb: 1, fontSize: 11, textTransform: "capitalize" }}
                        />

                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          color="text.primary"
                          sx={{
                            mb: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {article.articleTitle}
                        </Typography>

                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={article.memberData?.memberImage}
                              alt={article.memberData?.memberNick}
                              sx={{ width: 26, height: 26 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {article.memberData?.memberNick ?? "Anonymous"}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(article.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Typography>
                        </Box>
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
