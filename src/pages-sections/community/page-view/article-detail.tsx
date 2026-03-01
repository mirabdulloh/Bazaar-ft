"use client";

import { useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client/react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { GET_BOARD_ARTICLE } from "../../../../apollo/user/query";
import { LIKE_TARGET_BOARD_ARTICLE } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { useQuery } from "lib/hooks/useQuery";
import { Article } from "../../../lib/types/Article";
import { T } from "../../../lib/types/common";

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

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const {
		loading: getBoardArticleLoading,
		data: _getBoardArticleData,
		error: getBoardArticleError,
		refetch: getBoardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: "cache-and-network",
		variables: { input: initialInput.articleId },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticle(data?.getBoardArticle ?? null);
		},
	});

	/** HANDLERS **/
	const likeArticleHandler = async (e: T) => {
		try {
			e.preventDefault();
			if (!article?._id) return;
			if (!user._id) return;

			const currentlyLiked = article.meLiked?.[0]?.myFavorite ?? false;
			setArticle((prev) =>
				prev
					? {
							...prev,
							articleLikes: Math.max(
								0,
								prev.articleLikes + (currentlyLiked ? -1 : 1)
							),
							meLiked: [
								{
									memberId: user._id,
									likeRefId: prev._id,
									myFavorite: !currentlyLiked,
								},
							],
					  }
					: prev
			);

			await likeTargetBoardArticle({ variables: { input: article._id } });
			await getBoardArticleRefetch({ input: initialInput.articleId });
		} catch (err: any) {
			console.log("Error on likeArticleHandler:", err);
			await getBoardArticleRefetch({ input: initialInput.articleId });
		}
	};

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
		<Container sx={{ py: 6, maxWidth: "md" }}>
			{/* Back button */}
			<IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
				<ArrowBackIcon />
			</IconButton>

			{/* Category chip */}
			<Chip
				label={CATEGORY_LABELS[article.articleCategory] ?? article.articleCategory}
				color="primary"
				size="small"
				sx={{ mb: 2 }}
			/>

			{/* Title */}
			<Typography variant="h3" fontWeight={700} mb={2}>
				{article.articleTitle}
			</Typography>

			{/* Author + meta */}
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

			{/* Cover image */}
			{coverImage && (
				<Box
					component="img"
					src={coverImage}
					alt={article.articleTitle}
					sx={{
						width: "100%",
						borderRadius: 2,
						mb: 4,
						maxHeight: 480,
						objectFit: "cover",
					}}
				/>
			)}

			{/* Content */}
			<Typography
				variant="body1"
				color="text.primary"
				sx={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}
			>
				{article.articleContent ?? "No content available."}
			</Typography>
		</Container>
	);
};

ArticleDetailPageView.defaultProps = {
	initialInput: {
		articleId: "",
	},
};

export default ArticleDetailPageView;
