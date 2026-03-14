"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
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
import { sweetMixinErrorAlert, sweetTopSmallErrorAlert } from "../../../lib/sweetAlert";

type Props = {
  productId: string;
};

interface GqlReview {
  _id: string;
  reviewRating: number;
  reviewComment: string;
  reviewImages?: string[];
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

const resolveImage = (src?: string): string => {
  if (!src || src === "null" || src === "undefined") return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const normalized = src.startsWith("/") ? src : `/${src}`;
  return apiBase ? `${apiBase}${normalized}` : normalized;
};

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: "black", position: "relative" } }}>
      {/* Close */}
      <IconButton
        onClick={onClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 10, color: "white" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        {/* Prev arrow */}
        {images.length > 1 && (
          <IconButton
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            sx={{ position: "absolute", left: 8, color: "white", bgcolor: "rgba(0,0,0,0.4)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}

        {/* Image */}
        <Box
          component="img"
          src={images[idx]}
          alt={`Review image ${idx + 1}`}
          sx={{ maxHeight: "75vh", maxWidth: "100%", objectFit: "contain", display: "block", mx: "auto" }}
        />

        {/* Next arrow */}
        {images.length > 1 && (
          <IconButton
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            sx={{ position: "absolute", right: 8, color: "white", bgcolor: "rgba(0,0,0,0.4)", "&:hover": { bgcolor: "rgba(0,0,0,0.7)" } }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </DialogContent>

      {/* Dot indicators */}
      {images.length > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, py: 1.5 }}>
          {images.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIdx(i)}
              sx={{
                width: 8, height: 8, borderRadius: "50%", cursor: "pointer",
                bgcolor: i === idx ? "white" : "grey.600",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </Box>
      )}
    </Dialog>
  );
}

export default function ProductReviews(props: Props) {
  const { productId } = props;
  const user = useReactiveVar(userVar);
  const [reviews, setReviews] = useState<GqlReview[]>([]);
  const [page, setPage] = useState(1);
  const limit = 8;

  // Lightbox state
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
        page,
        limit,
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
  const totalReviews = useMemo(() => {
    if (noDataError) return 0;
    return Number((getReviewsData as T)?.getReviews?.metaCounter?.[0]?.total ?? 0);
  }, [getReviewsData, noDataError]);
  const pageCount = Math.max(1, Math.ceil(totalReviews / limit));

  const likeReviewHandler = async (user: T, reviewId: string) => {
    try {
      if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
      await likeTargetReview({ variables: { input: reviewId } });
      await getReviewsRefetch();
    } catch (err: any) {
      if (err.message === Message.NOT_AUTHENTICATED) {
        sweetTopSmallErrorAlert("Please log in to like reviews", 2500);
      } else {
        sweetMixinErrorAlert(err.message ?? Message.SOMETHING_WENT_WRONG);
      }
    }
  };

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
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

  return (
    <div>
      {/* REVIEW LIST */}
      {reviews.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 4 }}>
          No reviews yet for this product.
        </Typography>
      ) : (
        <>
          {reviews.map((review) => {
            const images = (review.reviewImages ?? [])
              .map(resolveImage)
              .filter(Boolean);

            return (
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

                <Typography variant="body1" sx={{ color: "grey.700", mb: images.length > 0 ? 1.5 : 0 }}>
                  {review.reviewComment}
                </Typography>

                {/* Review images — small thumbnails */}
                {images.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    {images.map((src, imgIdx) => (
                      <Box
                        key={imgIdx}
                        component="img"
                        src={src}
                        alt={`Review photo ${imgIdx + 1}`}
                        onClick={() => openLightbox(images, imgIdx)}
                        sx={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 1.5,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: "grey.200",
                          transition: "opacity 0.15s, transform 0.15s",
                          "&:hover": { opacity: 0.85, transform: "scale(1.04)" },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </ReviewRoot>
            );
          })}

          {totalReviews > limit && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                color="primary"
                page={page}
                count={pageCount}
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          )}
        </>
      )}

      {/* LIGHTBOX */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
