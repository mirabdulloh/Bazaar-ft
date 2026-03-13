"use client";

import { useEffect, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES } from "../../../../apollo/user/query";
import { LIKE_TARGET_BOARD_ARTICLE } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { useQuery } from "lib/hooks/useQuery";
import { Article } from "../../../lib/types/Article";
import { Message, T } from "../../../lib/types/common";
import ProductComments from "../../product-details/product-comments/product-comments";
import {
	sweetLikeSuccessAlert,
	sweetMixinErrorAlert,
	sweetTopSmallErrorAlert,
	sweetUnlikeAlert,
} from "../../../lib/sweetAlert";

const CATEGORY_LABELS: Record<string, string> = {
	FASHIONGUIDES: "Fashion Guides",
	TIPS: "Style Tips",
	REVIEW: "Reviews",
	NEWS: "News",
	OTHER: "Other",
};

const ArticleDetailPageView = ({ initialInput }: T) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [article, setArticle] = useState<Article | null>(null);
	const [moreArticles, setMoreArticles] = useState<Article[]>([]);
	const [commentCount, setCommentCount] = useState(0);
	const [commentsOpen, setCommentsOpen] = useState(false);

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: getBoardArticleLoading,
		data: _getBoardArticleData,
		error: getBoardArticleError,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: "cache-and-network",
		variables: { input: initialInput.articleId },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticle(data?.getBoardArticle ?? null);
		},
	});

	const {
		loading: _getBoardArticlesLoading,
		data: _getBoardArticlesData,
		error: _getBoardArticlesError,
		refetch: _getBoardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: "cache-and-network",
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: "createdAt",
				direction: "DESC",
				search: {},
			},
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			const list = data?.getBoardArticles?.list ?? [];
			setMoreArticles(
				list
					.filter((item: Article) => item._id !== initialInput.articleId)
					.slice(0, 2)
			);
		},
	});

	/** HANDLERS **/
	const likeArticleHandler = async (e: T) => {
		try {
			e.preventDefault();
			e.stopPropagation?.();
			if (!article?._id) return;
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);

			const currentlyLiked = article.meLiked?.[0]?.myFavorite ?? false;
			const { data } = await likeTargetBoardArticle({ variables: { input: article._id } });
			const updatedLikes =
				(data as T)?.likeTargetBoardArticle?.articleLikes ?? article.articleLikes ?? 0;
			const nextLiked = !currentlyLiked;

			setArticle((prev) =>
				prev
					? {
							...prev,
							articleLikes: updatedLikes,
							meLiked: [
								{
									memberId: user._id,
									likeRefId: prev._id,
									myFavorite: nextLiked,
								},
							],
					  }
					: prev
			);

			if (currentlyLiked) await sweetUnlikeAlert();
			else await sweetLikeSuccessAlert();
		} catch (err: any) {
			if (err.message === Message.NOT_AUTHENTICATED) {
				await sweetTopSmallErrorAlert("Please log in to like articles", 2500);
			} else {
				await sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
			}
		}
	};

	useEffect(() => {
		setCommentCount(article?.articleComments ?? 0);
	}, [article?.articleComments]);

	if (getBoardArticleLoading && !article) {
		return (
			<Box display="flex" justifyContent="center" py={10}>
				<CircularProgress />
			</Box>
		);
	}

	if (getBoardArticleError || !article) {
		return (
			<Container sx={{ py: 6 }}>
				<Typography color="error.main">Failed to load article.</Typography>
			</Container>
		);
	}

	const isLiked = article.meLiked?.[0]?.myFavorite ?? false;
	const coverImage =
		article.articleImages?.[0] ?? "/assets/images/products/product-1.png";

	return (
		<Container sx={{ py: 6, maxWidth: "lg" }}>
			<IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
				<ArrowBackIcon />
			</IconButton>

			<Chip
				label={CATEGORY_LABELS[article.articleCategory] ?? article.articleCategory}
				color="primary"
				size="small"
				sx={{ mb: 2 }}
			/>

			<Typography variant="h3" fontWeight={700} mb={2}>
				{article.articleTitle}
			</Typography>

			<Stack
				direction="row"
				alignItems="center"
				justifyContent="space-between"
				mb={3}
				flexWrap="wrap"
				gap={2}
			>
				<Stack direction="row" alignItems="center" gap={1.5}>
					<Avatar
						src={article.memberData?.memberImage}
						alt={article.memberData?.memberNick}
						sx={{ width: 36, height: 36 }}
					/>
					<Box>
						<Typography variant="subtitle2" fontWeight={600}>
							{article.memberData?.memberNick}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{new Date(article.createdAt).toLocaleDateString()}
						</Typography>
					</Box>
				</Stack>

				<Stack direction="row" alignItems="center" gap={2}>
					<Stack direction="row" alignItems="center" gap={0.5}>
						<VisibilityIcon sx={{ fontSize: 16, color: "text.secondary" }} />
						<Typography variant="body2" color="text.secondary">
							{article.articleViews}
						</Typography>
					</Stack>
					<Stack direction="row" alignItems="center" gap={0.5}>
						<IconButton
							size="small"
							onClick={likeArticleHandler}
							sx={{ color: isLiked ? "error.main" : "text.secondary" }}
						>
							{isLiked ? (
								<FavoriteIcon sx={{ fontSize: 18 }} />
							) : (
								<FavoriteBorderIcon sx={{ fontSize: 18 }} />
							)}
						</IconButton>
						<Typography variant="body2" color="text.secondary">
							{article.articleLikes}
						</Typography>
					</Stack>
				</Stack>
			</Stack>

			<Divider sx={{ mb: 3 }} />

			{coverImage && (
				<Box
					sx={{
						position: "relative",
						width: "100%",
						mb: 4,
						borderRadius: 2,
						overflow: "hidden",
						bgcolor: "grey.100",
						aspectRatio: { xs: "4/3", md: "21/9" },
					}}
				>
					<Box
						component="img"
						src={coverImage}
						alt={article.articleTitle}
						sx={{
							width: "100%",
							height: "100%",
							objectFit: "cover",
							display: "block",
						}}
					/>
				</Box>
			)}

			<Typography
				variant="body1"
				color="text.primary"
				sx={{ fontSize: { xs: 16.5, sm: 17 }, lineHeight: 1.9, whiteSpace: "pre-wrap" }}
			>
				{article.articleContent ?? "No content available."}
			</Typography>

			<Box
				sx={{
					mt: 6,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: 3,
					bgcolor: "background.paper",
					overflow: "hidden",
				}}
			>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					gap={2}
					onClick={() => setCommentsOpen((prev) => !prev)}
					sx={{
						px: { xs: 2, md: 3 },
						py: { xs: 2, md: 2.5 },
						cursor: "pointer",
						userSelect: "none",
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="h5" fontWeight={700}>
							Comments
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{commentsOpen ? "Tap to hide the discussion." : "Tap to open the discussion."}
						</Typography>
					</Box>
					<Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
						<Chip
							label={`${commentCount} comments`}
							variant="outlined"
							size="small"
						/>
						<IconButton
							size="small"
							aria-label={commentsOpen ? "Hide comments" : "Show comments"}
							sx={{
								transform: commentsOpen ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.2s ease",
							}}
						>
							<ExpandMoreIcon />
						</IconButton>
					</Stack>
				</Stack>

				<Collapse in={commentsOpen} timeout="auto" unmountOnExit>
					<Divider />
					<Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.5, md: 3 } }}>
						<ProductComments
							refId={article._id}
							commentGroup="ARTICLE"
							onCountChange={setCommentCount}
							maxWidth="100%"
							pageSize={5}
							emptyText="No comments on this article yet. Start the discussion."
							writePlaceholder="Write a comment about this article…"
							authText="Please log in to comment on this article."
						/>
					</Box>
				</Collapse>
			</Box>

			<Box sx={{ mt: 6 }}>
				<Typography variant="h5" fontWeight={700} mb={2}>
					More Articles
				</Typography>

				<Stack spacing={2}>
					{moreArticles.map((item: Article) => (
						<Box
							component={Link}
							href={`/community/${item._id}`}
							key={item._id}
							sx={{
								display: "grid",
								gridTemplateColumns: { xs: "1fr", sm: "140px 1fr" },
								gap: 2,
								p: 1.5,
								border: "1px solid",
								borderColor: "divider",
								borderRadius: 2,
								textDecoration: "none",
								color: "inherit",
								transition: "box-shadow 0.2s",
								"&:hover": { boxShadow: 2 },
							}}
						>
							<Box
								component="img"
								src={item.articleImages?.[0] ?? "/assets/images/products/product-1.png"}
								alt={item.articleTitle}
								sx={{
									width: "100%",
									height: { xs: 170, sm: 100 },
									borderRadius: 1.5,
									objectFit: "cover",
								}}
							/>

							<Box>
								<Chip
									size="small"
									label={CATEGORY_LABELS[item.articleCategory] ?? item.articleCategory}
									variant="outlined"
									sx={{ mb: 1 }}
								/>
								<Typography
									variant="subtitle1"
									fontWeight={700}
									sx={{
										display: "-webkit-box",
										WebkitLineClamp: 2,
										WebkitBoxOrient: "vertical",
										overflow: "hidden",
									}}
								>
									{item.articleTitle}
								</Typography>
							</Box>
						</Box>
					))}
				</Stack>
			</Box>
		</Container>
	);
};

ArticleDetailPageView.defaultProps = {
	initialInput: {
		articleId: "",
	},
};

export default ArticleDetailPageView;
