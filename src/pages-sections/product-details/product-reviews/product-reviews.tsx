"use client";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
// CUSTOM UTILS LIBRARY FUNCTION
import { getDateDifference } from "lib";
// STYLED COMPONENTS
import { ReviewRoot } from "./styles";
import { useQuery } from "lib/hooks/useQuery";
import { GET_REVIEWS } from "../../../../apollo/user/query";
import { T } from "lib/types/common";

type Props = {
  productId: string;
};

interface GqlReview {
  _id: string;
  reviewRating: number;
  reviewComment: string;
  createdAt: string;
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

export default function ProductReviews({ productId }: Props) {
  const { loading, data, error } = useQuery(GET_REVIEWS, {
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
    notifyOnNetworkStatusChange: true
  });

  const reviews: GqlReview[] = (data as T)?.getReviews?.list ?? [];
  const noDataError = error?.message?.toLowerCase().includes("no data found");

  if (loading && reviews.length === 0) {
    return (
      <Box py={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !noDataError) {
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
