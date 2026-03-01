"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useMutation, useReactiveVar } from "@apollo/client/react";
// CUSTOM UTILS LIBRARY FUNCTION
import { getDateDifference } from "lib";
// STYLED COMPONENTS
import { ReviewRoot } from "./styles";
import { useQuery } from "lib/hooks/useQuery";
import { GET_REVIEWS } from "../../../../apollo/user/query";
import { Message, T } from "lib/types/common";
import { LIKE_TARGET_REVIEW } from "../../../../apollo/user/mutation";
import { userVar } from "../../../../apollo/store";
import { sweetMixinErrorAlert } from "../../../lib/sweetAlert";

type Props = {
  productId: string;
};

interface GqlReview {
  _id: string;
  reviewRating: number;
  reviewComment: string;
  reviewLikes: number;
  createdAt: string;
  meLiked?: { myFavorite: boolean }[];
  memberData?: {
    _id: string;
    memberNick?: string;
    memberImage?: string;
  };
}

const DEFAULT_AVATAR = "/assets/images/faces/propic.png";

const resolveMemberImage = (memberImage?: string): string => {
  if (!memberImage || memberImage.trim() === "" || memberImage === "null" || memberImage === "undefined") {
    return DEFAULT_AVATAR;
  }

  if (memberImage.startsWith("http://") || memberImage.startsWith("https://")) {
    return memberImage;
  }

  const normalizedPath = memberImage.startsWith("/") ? memberImage : `/${memberImage}`;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  if (apiBase && !normalizedPath.startsWith("/assets/")) {
    return `${apiBase}${normalizedPath}`;
  }

  return normalizedPath;
};

export default function ProductReviews(props: Props) {
  const { productId } = props;
  const user = useReactiveVar(userVar);
  const [reviews, setReviews] = useState<GqlReview[]>([]);
  const [likeTargetReview] = useMutation(LIKE_TARGET_REVIEW);
  const {
    loading: getReviewsLoading,
    data: getReviewsData,
    error: getReviewsError,
    refetch: getReviewsRefetch
  } = useQuery(GET_REVIEWS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 20,
        sort: "createdAt",
        direction: "DESC",
        search: { productId }
      }
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setReviews(data?.getReviews?.list ?? []);
    }
  });
  void getReviewsData;

  const noDataError = getReviewsError?.message?.toLowerCase().includes("no data found");

  const likeReviewHandler = async (user: T, reviewId: string) => {
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      await likeTargetReview({ variables: { input: reviewId } });
      await getReviewsRefetch();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
    }
  };

  if (getReviewsLoading && reviews.length === 0) {
    return (
      <Box py={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (getReviewsError && !noDataError) {
    return (
      <Typography color="error.main" sx={{ mt: 2 }}>
        Failed to load reviews.
      </Typography>
    );
  }

  if (reviews.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        No reviews yet for this product.
      </Typography>
    );
  }

  return (
    <div>
      {/* REVIEW LIST */}
      {reviews.map((review) => (
        <ReviewRoot key={review._id}>
          <div className="user-info">
            <Avatar
              variant="rounded"
              className="user-avatar"
              src={resolveMemberImage(review.memberData?.memberImage)}
              alt={review.memberData?.memberNick || "User"}
            />

            <div>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {review.memberData?.memberNick || "User"}
              </Typography>

              <div className="user-rating">
                <Rating size="small" value={review.reviewRating} color="warn" readOnly />
                <Typography variant="h6">{review.reviewRating}</Typography>
                <Typography component="span">{getDateDifference(review.createdAt)}</Typography>
                <IconButton
                  size="small"
                  onClick={() => likeReviewHandler(user, review._id)}
                  sx={{ color: review.meLiked?.[0]?.myFavorite ? "error.main" : "text.secondary" }}
                >
                  {review.meLiked?.[0]?.myFavorite ? (
                    <FavoriteIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
                <Typography component="span">{review.reviewLikes ?? 0}</Typography>
              </div>
            </div>
          </div>

          <Typography variant="body1" sx={{ color: "grey.700" }}>
            {review.reviewComment}
          </Typography>
        </ReviewRoot>
      ))}
    </div>
  );
}
