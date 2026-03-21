"use client";

import { useMemo } from "react";
import { useTranslation } from "../react-i18next";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import ServerImage from "components/server-image";
import { useQuery } from "../../../lib/hooks/useQuery";
import { GET_BOARD_ARTICLES } from "../../../../apollo/user/query";
import { resolveServerMedia, resolveServerMediaThumb } from "lib/server-media";

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

const resolveArticleAsset = (path?: string | null) => resolveServerMedia(path);
const resolveArticleThumb = (path?: string | null) => resolveServerMediaThumb(path) || resolveServerMedia(path);

export default function SectionCommunity() {
  const { t } = useTranslation();

  const {
    loading: getArticlesLoading,
    data: getArticlesData,
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
  });

  const articles = useMemo(() => getArticlesData?.getBoardArticles?.list ?? [], [getArticlesData]);
  const showInitialLoading = getArticlesLoading && !articles.length;

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
        {showInitialLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
                <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="40%" />
              </Grid>
            ))
          : articles.map((article: GqlArticle) => (
              <Grid size={{ xs: 12, md: 4 }} key={article._id}>
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
                        <ServerImage
                          src={resolveArticleThumb(article.articleImages?.[0])}
                          fallbackSrc={resolveArticleAsset(article.articleImages?.[0])}
                          alt={article.articleTitle}
                          loading="lazy"
                          style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
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
                            src={resolveServerMediaThumb(article.memberData?.memberImage) || resolveArticleAsset(article.memberData?.memberImage)}
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
              </Grid>
            ))}
      </Grid>
    </Container>
  );
}
