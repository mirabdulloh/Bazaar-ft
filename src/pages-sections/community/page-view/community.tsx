"use client";

import { useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { useQuery } from "../../../lib/hooks/useQuery";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import { GET_BOARD_ARTICLES } from "../../../../apollo/user/query";
import { LIKE_TARGET_BOARD_ARTICLE } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { Article, ArticleCategory } from "../../../lib/types/Article";
import { T } from "../../../lib/types/common";

const CATEGORIES: { value: ArticleCategory | ""; label: string }[] = [
	{ value: "", label: "All" },
	{ value: "FASHIONGUIDES", label: "Fashion Guides" },
	{ value: "TIPS", label: "Style Tips" },
	{ value: "REVIEW", label: "Reviews" },
	{ value: "NEWS", label: "News" },
	{ value: "OTHER", label: "Other" },
];

const CommunityPageView = ({ initialInput = { page: 1, limit: 12, sort: "createdAt", direction: "DESC", search: {} } }: T) => {
	const user = useReactiveVar(userVar);
	const [searchArticles, setSearchArticles] = useState({ ...initialInput });
	const [articles, setArticles] = useState<Article[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [activeCategory, setActiveCategory] = useState<ArticleCategory | "">("");

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: getBoardArticlesLoading,
		data: _getBoardArticlesData,
		error: getBoardArticlesError,
		refetch: getBoardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: "cache-and-network",
		variables: { input: searchArticles },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
			setTotalCount(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const categoryHandler = (category: ArticleCategory | "") => {
		setActiveCategory(category);
		const search = category ? { articleCategory: category } : {};
		setSearchArticles({ ...initialInput, search });
	};

	const paginationHandler = (_e: T, value: number) => {
		setSearchArticles({ ...searchArticles, page: value });
	};

	const likeArticleHandler = async (e: T, articleId: string) => {
		try {
			e.preventDefault();
			if (!articleId) return;
			if (!user._id) return;

			// Optimistic UI update to prevent card flicker while refetching
			const currentArticle = articles.find((article) => article._id === articleId);
			const currentlyLiked = currentArticle?.meLiked?.[0]?.myFavorite ?? false;

			setArticles((prev) =>
				prev.map((article) =>
					article._id === articleId
						? {
								...article,
								articleLikes: Math.max(
									0,
									article.articleLikes + (currentlyLiked ? -1 : 1)
								),
								meLiked: [
									{
										memberId: user._id,
										likeRefId: articleId,
										myFavorite: !currentlyLiked,
									},
								],
						  }
						: article
				)
			);

			await likeTargetBoardArticle({ variables: { input: articleId } });
			await getBoardArticlesRefetch({ input: searchArticles });
		} catch (err: any) {
			console.log("Error on likeArticleHandler:", err);
			await getBoardArticlesRefetch({ input: searchArticles });
		}
	};

	const isInitialLoading = getBoardArticlesLoading && articles.length === 0;

	return (
		<Container sx={{ py: 6 }}>
			<Typography variant="h3" fontWeight={700} mb={1}>
				Community
			</Typography>
			<Typography variant="body1" color="text.secondary" mb={4}>
				Fashion guides, style tips, and inspiration from the BAZAAR community.
			</Typography>

			{/* Category filter */}
			<Stack direction="row" flexWrap="wrap" gap={1} mb={5}>
				{CATEGORIES.map((cat) => (
					<Chip
						key={cat.value}
						label={cat.label}
						onClick={() => categoryHandler(cat.value)}
						color={activeCategory === cat.value ? "primary" : "default"}
						variant={activeCategory === cat.value ? "filled" : "outlined"}
						sx={{ fontWeight: 500 }}
					/>
				))}
			</Stack>

			{isInitialLoading ? (
				<Box display="flex" justifyContent="center" py={8}>
					<CircularProgress />
				</Box>
			) : getBoardArticlesError ? (
				<Typography color="error.main">Failed to load articles.</Typography>
			) : articles.length === 0 ? (
				<Box textAlign="center" py={8}>
					<Typography color="text.secondary">No articles found.</Typography>
				</Box>
			) : (
				<>
					<Grid container spacing={3}>
						{articles.map((article: Article) => {
							const isLiked = article.meLiked?.[0]?.myFavorite ?? false;
							const coverImage =
								article.articleImages?.[0] ??
								"/assets/images/products/product-1.png";

							return (
								<Grid size={{ xs: 12, sm: 6, md: 4 }} key={article._id}>
									<Card
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											transition: "box-shadow 0.2s",
											"&:hover": { boxShadow: 4 },
										}}
									>
										<Link
											href={`/community/${article._id}`}
											style={{ textDecoration: "none" }}
										>
											<CardMedia
												component="img"
												height="200"
												image={coverImage}
												alt={article.articleTitle}
												sx={{ objectFit: "cover" }}
											/>
										</Link>

										<CardContent
											sx={{
												flexGrow: 1,
												display: "flex",
												flexDirection: "column",
											}}
										>
											<Chip
												label={
													CATEGORIES.find(
														(c) => c.value === article.articleCategory
													)?.label ?? article.articleCategory
												}
												size="small"
												color="primary"
												variant="outlined"
												sx={{ mb: 1, alignSelf: "flex-start" }}
											/>

											<Link
												href={`/community/${article._id}`}
												style={{ textDecoration: "none", color: "inherit" }}
											>
												<Typography
													variant="subtitle1"
													fontWeight={600}
													mb={1}
													sx={{
														lineHeight: 1.35,
														minHeight: "2.7em",
														display: "-webkit-box",
														WebkitLineClamp: 2,
														WebkitBoxOrient: "vertical",
														overflow: "hidden",
													}}
												>
													{article.articleTitle}
												</Typography>
											</Link>

											{/* Author + meta */}
											<Stack
												direction="row"
												alignItems="center"
												justifyContent="space-between"
												mt="auto"
											>
												<Stack direction="row" alignItems="center" gap={1}>
													<Avatar
														src={article.memberData?.memberImage}
														alt={article.memberData?.memberNick}
														sx={{ width: 28, height: 28, fontSize: 12 }}
													/>
													<Typography variant="caption" color="text.secondary">
														{article.memberData?.memberNick}
													</Typography>
												</Stack>

												<Stack direction="row" alignItems="center" gap={0.5}>
													<VisibilityIcon
														sx={{ fontSize: 14, color: "text.secondary" }}
													/>
													<Typography variant="caption" color="text.secondary">
														{article.articleViews}
													</Typography>

													<IconButton
														size="small"
														onClick={(e) => likeArticleHandler(e, article._id)}
														sx={{ ml: 0.5, color: isLiked ? "error.main" : "text.secondary" }}
													>
														{isLiked ? (
															<FavoriteIcon sx={{ fontSize: 16 }} />
														) : (
															<FavoriteBorderIcon sx={{ fontSize: 16 }} />
														)}
													</IconButton>
													<Typography variant="caption" color="text.secondary">
														{article.articleLikes}
													</Typography>
												</Stack>
											</Stack>
										</CardContent>
									</Card>
								</Grid>
							);
						})}
					</Grid>

					{totalCount > searchArticles.limit && (
						<Stack alignItems="center" mt={6}>
							<Pagination
								count={Math.ceil(totalCount / searchArticles.limit)}
								page={searchArticles.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
							<Typography variant="caption" color="text.secondary" mt={1}>
								Total {totalCount} article(s)
							</Typography>
						</Stack>
					)}
				</>
			)}
		</Container>
	);
};

CommunityPageView.defaultProps = {
	initialInput: {
		page: 1,
		limit: 12,
		sort: "createdAt",
		direction: "DESC",
		search: {},
	},
};

export default CommunityPageView;
