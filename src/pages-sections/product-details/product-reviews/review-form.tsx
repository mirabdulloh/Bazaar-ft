"use client";

import { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
// MUI
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
// GLOBAL CUSTOM COMPONENTS
import { FormProvider, TextField } from "components/form-hook";
// STYLED COMPONENTS
import { RatingGroup } from "./styles";
// APOLLO
import { useMutation, useReactiveVar } from "@apollo/client/react";
import { userVar } from "../../../../apollo/store";
import { CREATE_REVIEW } from "../../../../apollo/user/mutation";
import { GET_MY_ORDERS } from "../../../../apollo/user/query";
import { useQuery } from "lib/hooks/useQuery";
// UTILS
import { getJwtToken } from "lib/auth";
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "lib/types/common";

const MAX_IMAGES = 5;

const validationSchema = yup.object().shape({
  rating: yup.number().min(1, "Please select a rating").required("Rating is required"),
  comment: yup.string().min(10, "Review must be at least 10 characters").required("Comment is required"),
});

type FormValues = { rating: number; comment: string };

interface Props {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: Props) {
  const user = useReactiveVar(userVar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const methods = useForm<FormValues>({
    defaultValues: { rating: 0, comment: "" },
    resolver: yupResolver(validationSchema),
  });
  const { control, handleSubmit, reset, formState: { isSubmitting } } = methods;

  // Find eligible (DELIVERED) orderItem for this product
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: "cache-and-network",
    skip: !user?._id,
    variables: {
      input: { page: 1, limit: 50, search: { orderStatus: "DELIVERED" } },
    },
  });

  const eligibleOrderItemId: string | null = (() => {
    const orders: T[] = (ordersData as T)?.getMyOrders?.orders ?? [];
    for (const order of orders) {
      for (const item of order.orderItems ?? []) {
        if (item.productId === productId) return item._id as string;
      }
    }
    return null;
  })();

  const [createReview] = useMutation(CREATE_REVIEW);

  // ── Image file handlers ────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - files.length;
    if (!remaining) return;
    const toAdd = selected.slice(0, remaining);
    setFiles((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmitForm = handleSubmit(async (values: FormValues) => {
    if (!user?._id) {
      sweetMixinErrorAlert("Please log in to write a review");
      return;
    }
    if (!eligibleOrderItemId) {
      sweetMixinErrorAlert("You need to purchase and receive this product before reviewing.");
      return;
    }

    try {
      let reviewImages: string[] = [];

      if (files.length > 0) {
        setUploading(true);
        const token = getJwtToken();
        const fileVars: Record<string, string[]> = {};
        files.forEach((_, i) => { fileVars[String(i)] = [`variables.files.${i}`]; });

        const formData = new FormData();
        formData.append(
          "operations",
          JSON.stringify({
            query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
              imagesUploader(files: $files, target: $target)
            }`,
            variables: { files: files.map(() => null), target: "reviews" },
          })
        );
        formData.append("map", JSON.stringify(fileVars));
        files.forEach((file, i) => formData.append(String(i), file));

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "apollo-require-preflight": "true",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        reviewImages = (response.data?.data?.imagesUploader ?? [])
          .filter((image: unknown): image is string => typeof image === "string")
          .map((image: string) => image.trim())
          .filter(Boolean);

        if (reviewImages.length !== files.length) {
          setUploading(false);
          sweetMixinErrorAlert("Some images failed to upload. Use PNG, JPG, or JPEG files only.");
          return;
        }

        setUploading(false);
      }

      await createReview({
        variables: {
          input: {
            productId,
            orderItemId: eligibleOrderItemId,
            reviewRating: values.rating,
            reviewComment: values.comment,
            reviewImages,
          },
        },
      });

      reset();
      previews.forEach((p) => URL.revokeObjectURL(p));
      setFiles([]);
      setPreviews([]);

      await sweetTopSmallSuccessAlert("Your review has been submitted!", 3000);
      onSuccess?.();
    } catch (err: any) {
      setUploading(false);
      const msg = err?.graphQLErrors?.[0]?.message ?? err?.message ?? "Failed to submit review";
      sweetMixinErrorAlert(msg);
    }
  });

  // ── Not logged in ──────────────────────────────────────────────────────────

  if (!user?._id) {
    return (
      <Typography variant="body2" color="text.secondary">
        <a href="/login" style={{ color: "inherit", fontWeight: 600 }}>Log in</a> to write a review.
      </Typography>
    );
  }

  if (ordersLoading) {
    return <CircularProgress size={24} />;
  }

  if (!eligibleOrderItemId) {
    return (
      <Typography variant="body2" color="text.secondary">
        Purchase and receive this product to leave a review.
      </Typography>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <FormProvider methods={methods} onSubmit={handleSubmitForm}>
      {/* Rating */}
      <RatingGroup>
        <Typography variant="h6" sx={{ color: "grey.700", span: { color: "error.main" } }}>
          Your Rating <span>*</span>
        </Typography>
        <Controller
          name="rating"
          control={control}
          render={({ field, fieldState }: { field: any; fieldState: any }) => (
            <Box>
              <Rating
                color="warn"
                size="medium"
                name={field.name}
                value={field.value}
                onChange={(_, value) => field.onChange(value)}
              />
              {fieldState.error && (
                <Typography variant="caption" color="error.main" sx={{ display: "block" }}>
                  {fieldState.error.message}
                </Typography>
              )}
            </Box>
          )}
        />
      </RatingGroup>

      {/* Comment */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ mb: 1, color: "grey.700", span: { color: "error.main" } }}>
          Your Review <span>*</span>
        </Typography>
        <TextField
          rows={5}
          multiline
          fullWidth
          name="comment"
          variant="outlined"
          placeholder="Share your thoughts about this product..."
        />
      </Box>

      {/* Image upload */}
      <Box mb={3}>
        <Typography variant="h6" sx={{ mb: 1, color: "grey.700" }}>
          Add Photos{" "}
          <Typography component="span" variant="caption" color="text.secondary">
            (up to {MAX_IMAGES})
          </Typography>
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          {/* Previews */}
          {previews.map((src, i) => (
            <Box
              key={i}
              sx={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}
            >
              <Box
                component="img"
                src={src}
                alt={`Preview ${i + 1}`}
                sx={{
                  width: 80, height: 80, objectFit: "cover", borderRadius: 2,
                  border: "1px solid", borderColor: "grey.200",
                }}
              />
              <IconButton
                size="small"
                onClick={() => removeImage(i)}
                sx={{
                  position: "absolute", top: -8, right: -8,
                  width: 20, height: 20,
                  bgcolor: "grey.800", color: "white",
                  "&:hover": { bgcolor: "error.main" },
                  p: 0,
                }}
              >
                <CloseIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          ))}

          {/* Add button */}
          {files.length < MAX_IMAGES && (
            <Box
              component="label"
              htmlFor="review-image-input"
              sx={{
                width: 80, height: 80,
                border: "2px dashed", borderColor: "grey.300", borderRadius: 2,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "grey.500",
                transition: "border-color 0.2s, color 0.2s",
                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                flexShrink: 0,
              }}
            >
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 28, mb: 0.25 }} />
              <Typography variant="caption" sx={{ lineHeight: 1 }}>
                {files.length}/{MAX_IMAGES}
              </Typography>
              <input
                id="review-image-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFileChange}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        loading={isSubmitting || uploading}
        sx={{ minWidth: 140 }}
      >
        Submit Review
      </Button>
    </FormProvider>
  );
}
