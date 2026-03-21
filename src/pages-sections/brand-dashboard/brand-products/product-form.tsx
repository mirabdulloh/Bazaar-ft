"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import FlexBox from "components/flex-box/flex-box";
import DropZone from "components/DropZone";
import PageWrapper from "../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { CREATE_PRODUCT, UPDATE_PRODUCT } from "../../../../apollo/brand/mutation";
import { GET_BRAND_PRODUCT } from "../../../../apollo/brand/query";
import { GET_CATEGORIES } from "../../../../apollo/user/query";
import { T } from "lib/types/common";
// AUTH
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken, setUserFromMemberData } from "lib/auth";
// ALERTS
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
// STYLED
import { UploadImageBox, StyledClear } from "../styles";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_TYPES = ["CLOTHING", "SHOES", "ACCECORY", "BAG", "BEAUTY", "LIFESTYLE", "SPORTS", "OTHER"];
const PRODUCT_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SOLD_OUT", "HIDDEN", "DELETED"];
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const EU_SHOE_SIZES = ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44"];
const DENIM_SIZES = ["28/30", "30/30", "32/30", "32/32", "34/30"];
const ACCESSORY_SIZES = ["ONE SIZE", "SMALL", "MEDIUM", "LARGE"];
const BEAUTY_SIZES = ["50ML", "100ML", "250ML", "500ML"];
const COLOR_OPTIONS = ["Black", "White", "Blue", "Red", "Green", "Yellow", "Orange", "Grey", "Pink", "Brown"];
const MATERIAL_OPTIONS = ["Cotton", "Leather", "Wool", "Denim", "Polyester", "Silk", "Synthetic"];
const MAX_PRODUCT_IMAGES = 5;

type SizeGroup = {
  title: string;
  values: string[];
};

function resolveProductImage(productImage?: string | null): string {
  if (!productImage || productImage === "null" || productImage === "undefined") return "";
  if (productImage.startsWith("http://") || productImage.startsWith("https://")) return productImage;

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const normalized = productImage.startsWith("/") ? productImage : `/${productImage}`;

  if (normalized.startsWith("/assets/") || normalized.startsWith("/img/") || normalized.startsWith("/placeholder/")) {
    return normalized;
  }

  return apiBase ? `${apiBase}${normalized}` : normalized;
}

function parseDelimitedValues(value?: string | null): string[] {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(/[,|]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function joinDelimitedValues(values: string[]): string {
  return values.join(", ");
}

function getSizeGroups(productType: string, categoryName?: string): SizeGroup[] {
  const normalizedCategory = (categoryName ?? "").toLowerCase();

  if (normalizedCategory.includes("shoe")) {
    return [{ title: "Shoes - EU", values: EU_SHOE_SIZES }];
  }

  if (
    normalizedCategory.includes("denim") ||
    normalizedCategory.includes("jean") ||
    normalizedCategory.includes("trouser") ||
    normalizedCategory.includes("pants")
  ) {
    return [{ title: "Denim", values: DENIM_SIZES }];
  }

  if (
    normalizedCategory.includes("dress") ||
    normalizedCategory.includes("shirt") ||
    normalizedCategory.includes("tee") ||
    normalizedCategory.includes("top") ||
    normalizedCategory.includes("hoodie") ||
    normalizedCategory.includes("jacket") ||
    normalizedCategory.includes("clothing")
  ) {
    return [{ title: "Clothing", values: CLOTHING_SIZES }];
  }

  if (normalizedCategory.includes("bag") || normalizedCategory.includes("accessor")) {
    return [{ title: "Accessories", values: ACCESSORY_SIZES }];
  }

  if (normalizedCategory.includes("beauty") || normalizedCategory.includes("skincare") || normalizedCategory.includes("cosmetic")) {
    return [{ title: "Beauty", values: BEAUTY_SIZES }];
  }

  switch (productType) {
    case "SHOES":
      return [{ title: "Shoes - EU", values: EU_SHOE_SIZES }];
    case "BAG":
    case "ACCECORY":
      return [{ title: "Accessories", values: ACCESSORY_SIZES }];
    case "BEAUTY":
      return [{ title: "Beauty", values: BEAUTY_SIZES }];
    case "LIFESTYLE":
      return [
        { title: "Accessories", values: ACCESSORY_SIZES },
        { title: "Beauty", values: BEAUTY_SIZES }
      ];
    case "SPORTS":
      return [
        { title: "Clothing", values: CLOTHING_SIZES },
        { title: "Shoes - EU", values: EU_SHOE_SIZES }
      ];
    case "OTHER":
      return [
        { title: "Clothing", values: CLOTHING_SIZES },
        { title: "Accessories", values: ["ONE SIZE"] }
      ];
    case "CLOTHING":
    default:
      return [
        { title: "Clothing", values: CLOTHING_SIZES },
        { title: "Denim", values: DENIM_SIZES }
      ];
  }
}

async function getValidToken(): Promise<string> {
  let token = getJwtToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = (payload.exp ?? 0) * 1000;
      if (Date.now() < expiresAt - 30_000) return token;
    } catch {
      // Fall through to refresh.
    }
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("Session expired. Please log in again.");

  const res = await fetch(process.env.NEXT_PUBLIC_API_GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          _id memberType memberStatus memberAuthType memberPhone memberNick
          memberFullName memberEmail memberImage memberAddress memberDesc
          memberArticles memberFollowers memberFollowings memberPoints
          memberLikes memberViews memberComments memberRank memberWarnings
          memberBlocks memberProducts accessToken refreshToken
        }
      }`,
      variables: { refreshToken },
    }),
  });

  const json = await res.json();
  const data = json?.data?.refreshToken;
  if (!data?.accessToken) throw new Error("Session expired. Please log in again.");

  setJwtToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  setUserFromMemberData(data);

  return data.accessToken;
}

const initialForm = {
  productType: "CLOTHING",
  productStatus: "DRAFT",
  productCategoryId: "",
  productTitle: "",
  productPrice: "",
  productDiscountPrice: "",
  productStockQuantity: "",
  productDesc: "",
  productSize: "",
  productColor: "",
  productMaterials: ""
};

// ============================================================================
type Props = {
  productId?: string;
  embedded?: boolean;
  onSaved?: (product?: any) => void | Promise<void>;
  onCancel?: () => void;
};
// ============================================================================

export default function BrandProductForm({ productId, embedded = false, onSaved, onCancel }: Props) {
  const router = useRouter();
  const isEdit = !!productId;

  const [form, setForm] = useState(initialForm);
  /** Server paths (uploads/products/...) for images already on server */
  const [serverImages, setServerImages] = useState<string[]>([]);
  /** New files the user dropped, not yet uploaded */
  const [newFiles, setNewFiles] = useState<File[]>([]);
  /** Blob preview URLs for newFiles (parallel array) */
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const selectedSizes = parseDelimitedValues(form.productSize);
  const selectedColors = parseDelimitedValues(form.productColor);

  // ─── Load categories ────────────────────────────────────────────────────────
  const { data: catData } = useQuery(GET_CATEGORIES, {
    variables: { input: { page: 1, limit: 100, sort: "createdAt", direction: "DESC" } }
  });
  const categories = (catData as T)?.getCategories?.list?.filter(
    (c: any) => c.categoryStatus === "ACTIVE"
  ) ?? [];
  const selectedCategory = categories.find((category: any) => category._id === form.productCategoryId);
  const sizeGroups = useMemo(
    () => getSizeGroups(form.productType, selectedCategory?.categoryName),
    [form.productType, selectedCategory?.categoryName]
  );
  const availableSizeOptions = useMemo(
    () => sizeGroups.flatMap((group) => group.values),
    [sizeGroups]
  );
  const availableSizesKey = useMemo(
    () => availableSizeOptions.join("|"),
    [availableSizeOptions]
  );

  useEffect(() => {
    setForm((prev) => {
      const nextSizes = parseDelimitedValues(prev.productSize).filter((size) => availableSizeOptions.includes(size));
      const nextJoined = joinDelimitedValues(nextSizes);
      if (nextJoined === prev.productSize) return prev;
      return { ...prev, productSize: nextJoined };
    });
  }, [availableSizesKey]);

  // ─── Load existing product for edit ─────────────────────────────────────────
  const { data: prodData, loading: loadingProduct, error: productError } = useQuery(GET_BRAND_PRODUCT, {
    skip: !isEdit,
    fetchPolicy: "network-only",
    variables: { input: productId }
  });

  useEffect(() => {
    if (!isEdit || !prodData) return;
    const product = (prodData as T)?.getBrandProduct;
    if (!product) return;

    setForm({
      productType: product.productType || "CLOTHING",
      productStatus: product.productStatus || "DRAFT",
      productCategoryId: product.productCategoryId || "",
      productTitle: product.productTitle || "",
      productPrice: String(product.productPrice ?? ""),
      productDiscountPrice: String(product.productDiscountPrice ?? ""),
      productStockQuantity: String(product.productStockQuantity ?? ""),
      productDesc: product.productDesc || "",
      productSize: product.productSize || "",
      productColor: product.productColor || "",
      productMaterials: product.productMaterials || ""
    });
    setServerImages(product.productImages || []);
  }, [isEdit, prodData, productId]);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);

  // ─── Image handling ─────────────────────────────────────────────────────────
  const handleImageDrop = useCallback((files: File[]) => {
    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  }, []);

  /** Combined list for display: server images + new previews */
  const allDisplayImages = [...serverImages, ...newPreviews];
  const totalImages = allDisplayImages.length;
  const remainingImageSlots = Math.max(0, MAX_PRODUCT_IMAGES - totalImages);

  const handleRemoveImage = useCallback((index: number) => {
    if (index < serverImages.length) {
      // Removing an existing server image
      setServerImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly added file
      const newIdx = index - serverImages.length;
      setNewFiles((prev) => prev.filter((_, i) => i !== newIdx));
      setNewPreviews((prev) => prev.filter((_, i) => i !== newIdx));
    }
  }, [serverImages.length]);

  // ─── Form change ───────────────────────────────────────────────────────────
  const handleChange = (field: string) => (e: any) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleMultiValueChange = useCallback((field: "productColor") => (event: any) => {
    const value = event.target.value as string[];
    setForm((prev) => ({ ...prev, [field]: joinDelimitedValues(value) }));
  }, []);

  const toggleSize = useCallback((size: string) => {
    setForm((prev) => {
      const current = parseDelimitedValues(prev.productSize);
      const next = current.includes(size) ? current.filter((item) => item !== size) : [...current, size];
      return { ...prev, productSize: joinDelimitedValues(next) };
    });
  }, []);

  const handleImageDropLimited = useCallback(async (files: File[]) => {
    if (remainingImageSlots <= 0) {
      await sweetMixinErrorAlert(`You can upload up to ${MAX_PRODUCT_IMAGES} product images.`);
      return;
    }

    const acceptedFiles = files.slice(0, remainingImageSlots);
    handleImageDrop(acceptedFiles);

    if (files.length > acceptedFiles.length) {
      await sweetMixinErrorAlert(`Only ${MAX_PRODUCT_IMAGES} product images are allowed.`);
    }
  }, [handleImageDrop, remainingImageSlots]);

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.productTitle.trim()) {
      await sweetMixinErrorAlert("Product title is required.");
      return;
    }
    if (!form.productPrice || Number(form.productPrice) <= 0) {
      await sweetMixinErrorAlert("Product price must be greater than 0.");
      return;
    }
    if (selectedSizes.length === 0) {
      await sweetMixinErrorAlert("Select at least one size.");
      return;
    }
    if (selectedColors.length === 0) {
      await sweetMixinErrorAlert("Select at least one color.");
      return;
    }
    if (totalImages === 0) {
      await sweetMixinErrorAlert("At least one product image is required.");
      return;
    }

    try {
      // --- Upload new files via multipart/form-data (graphql-upload spec) ---
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        const token = await getValidToken();

        const fileVars: Record<string, string[]> = {};
        newFiles.forEach((_, idx) => {
          fileVars[String(idx)] = [`variables.files.${idx}`];
        });

        const formData = new FormData();
        formData.append(
          "operations",
          JSON.stringify({
            query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
              imagesUploader(files: $files, target: $target)
            }`,
            variables: {
              files: newFiles.map(() => null),
              target: "products"
            }
          })
        );
        formData.append("map", JSON.stringify(fileVars));
        newFiles.forEach((file, idx) => {
          formData.append(String(idx), file);
        });

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_GRAPHQL_URL}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "apollo-require-preflight": "true",
              Authorization: `Bearer ${token}`
            }
          }
        );

        uploadedUrls = response.data?.data?.imagesUploader ?? [];
        if (!uploadedUrls.length) throw new Error("Image upload failed");
      }

      const allImages = [...serverImages, ...uploadedUrls];

      const input: any = {
        productType: form.productType,
        productTitle: form.productTitle.trim(),
        productPrice: Number(form.productPrice),
        productImages: allImages,
        productSize: joinDelimitedValues(selectedSizes),
        productColor: joinDelimitedValues(selectedColors)
      };

      if (isEdit) input.productStatus = form.productStatus;

      if (form.productCategoryId) input.productCategoryId = form.productCategoryId;
      if (form.productDiscountPrice) input.productDiscountPrice = Number(form.productDiscountPrice);
      if (form.productStockQuantity) input.productStockQuantity = Number(form.productStockQuantity);
      if (form.productDesc?.trim()) input.productDesc = form.productDesc.trim();
      if (form.productMaterials?.trim()) input.productMaterials = form.productMaterials.trim();

      if (isEdit) {
        input._id = productId;
        const result = await updateProduct({ variables: { input } });
        await sweetTopSmallSuccessAlert("Product updated");
        await onSaved?.(result?.data?.updateProduct);
      } else {
        const result = await createProduct({ variables: { input } });
        await sweetTopSmallSuccessAlert("Product created");
        await onSaved?.(result?.data?.createProduct);
      }
      if (!onSaved) router.push("/brand/products");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to save product");
    }
  };

  const saving = creating || updating;

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
      return;
    }
    router.push("/brand/products");
  }, [onCancel, router]);

  const renderContent = () => (
    <Card sx={{ p: 3, boxShadow: embedded ? "none" : undefined }}>
      <Grid container spacing={3}>
        {/* Product Title */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Product Title"
            value={form.productTitle}
            onChange={handleChange("productTitle")}
            required
          />
        </Grid>

        {/* Type, Status & Category */}
        <Grid size={{ xs: 12, sm: isEdit ? 4 : 6 }}>
          <FormControl fullWidth>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={form.productType}
              label="Product Type"
              onChange={handleChange("productType")}
            >
              {PRODUCT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {isEdit && (
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={form.productStatus}
                label="Status"
                onChange={handleChange("productStatus")}
              >
                {PRODUCT_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: isEdit ? 4 : 6 }}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={form.productCategoryId}
              label="Category"
              onChange={handleChange("productCategoryId")}
            >
              <MenuItem value="">None</MenuItem>
              {categories.map((cat: any) => (
                <MenuItem key={cat._id} value={cat._id}>{cat.categoryName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Price */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={form.productPrice}
            onChange={handleChange("productPrice")}
            required
            slotProps={{
              input: { inputProps: { min: 0, step: 0.01 } }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Discount Price"
            type="number"
            value={form.productDiscountPrice}
            onChange={handleChange("productDiscountPrice")}
            slotProps={{
              input: { inputProps: { min: 0, step: 0.01 } }
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Stock Quantity"
            type="number"
            value={form.productStockQuantity}
            onChange={handleChange("productStockQuantity")}
            slotProps={{
              input: { inputProps: { min: 0 } }
            }}
          />
        </Grid>

        {/* Size, Color, Materials */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Sizes
          </Typography>
          <FlexBox flexDirection="column" gap={1.5}>
            {sizeGroups.map((group) => (
              <div key={group.title}>
                <Typography variant="caption" sx={{ color: "grey.600", mb: 0.75, display: "block" }}>
                  {group.title}
                </Typography>
                <FlexBox flexWrap="wrap" gap={0.75}>
                  {group.values.map((size) => {
                    const selected = selectedSizes.includes(size);
                    return (
                      <Chip
                        key={size}
                        label={size}
                        size="small"
                        variant={selected ? "filled" : "outlined"}
                        color={selected ? "primary" : "default"}
                        onClick={() => toggleSize(size)}
                        sx={{ cursor: "pointer" }}
                      />
                    );
                  })}
                </FlexBox>
              </div>
            ))}
          </FlexBox>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth required>
            <InputLabel>Colors</InputLabel>
            <Select
              multiple
              value={selectedColors}
              label="Colors"
              onChange={handleMultiValueChange("productColor")}
              renderValue={(selected) => (
                <FlexBox flexWrap="wrap" gap={0.5}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </FlexBox>
              )}
            >
              {COLOR_OPTIONS.map((color) => (
                <MenuItem key={color} value={color}>{color}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Material</InputLabel>
            <Select
              value={form.productMaterials}
              label="Material"
              onChange={handleChange("productMaterials")}
            >
              <MenuItem value="">None</MenuItem>
              {MATERIAL_OPTIONS.map((material) => (
                <MenuItem key={material} value={material}>{material}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Description"
            value={form.productDesc}
            onChange={handleChange("productDesc")}
          />
        </Grid>

        {/* Images */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Product Images</Typography>
          <DropZone
            onChange={handleImageDropLimited}
            maxFiles={remainingImageSlots || 1}
            disabled={remainingImageSlots === 0}
            info={
              remainingImageSlots === 0
                ? `Maximum ${MAX_PRODUCT_IMAGES} product images reached. Remove one to upload another.`
                : `Upload product images (PNG, JPG, GIF). ${remainingImageSlots} slot${remainingImageSlots === 1 ? "" : "s"} left.`
            }
          />

          {allDisplayImages.length > 0 && (
            <FlexBox gap={1} mt={2} flexWrap="wrap">
              {allDisplayImages.map((url, idx) => {
                const imgSrc = url.startsWith("blob:") ? url : resolveProductImage(url);
                return (
                  <UploadImageBox key={idx}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={`product-${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <StyledClear onClick={() => handleRemoveImage(idx)} />
                  </UploadImageBox>
                );
              })}
            </FlexBox>
          )}
        </Grid>

        {/* Actions */}
        <Grid size={{ xs: 12 }}>
          <FlexBox gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={handleSubmit}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} /> : undefined}
            >
              {isEdit ? "Update Product" : "Create Product"}
            </Button>
          </FlexBox>
        </Grid>
      </Grid>
    </Card>
  );

  if (isEdit && loadingProduct) {
    if (embedded) {
      return <Typography sx={{ p: 3 }}>Loading product...</Typography>;
    }
    return (
      <PageWrapper title="Edit Product">
        <Typography>Loading product...</Typography>
      </PageWrapper>
    );
  }

  if (isEdit && productError) {
    if (embedded) {
      return (
        <Card sx={{ p: 4, textAlign: "center", boxShadow: "none" }}>
          <Typography variant="h6" gutterBottom>Product Not Available</Typography>
          <Typography color="text.secondary">
            This product could not be loaded for editing.
          </Typography>
        </Card>
      );
    }
    return (
      <PageWrapper title="Edit Product">
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>Product Not Available</Typography>
          <Typography color="text.secondary">
            This product could not be loaded for editing.
          </Typography>
        </Card>
      </PageWrapper>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  if (embedded) return renderContent();

  return (
    <PageWrapper title={isEdit ? "Edit Product" : "Add New Product"}>
      {renderContent()}
    </PageWrapper>
  );
}
