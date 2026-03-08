"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Clear from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";
import FlexBox from "components/flex-box/flex-box";
import DropZone from "components/DropZone";
import PageWrapper from "../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { CREATE_PRODUCT, UPDATE_PRODUCT } from "../../../../apollo/brand/mutation";
import { GET_BRAND_PRODUCTS } from "../../../../apollo/brand/query";
import { GET_CATEGORIES } from "../../../../apollo/user/query";
import { T } from "lib/types/common";
// ALERTS
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";
// STYLED
import { UploadImageBox, StyledClear } from "../styles";

// ─── Constants ────────────────────────────────────────────────────────────────
const PRODUCT_TYPES = ["CLOTHING", "SHOES", "ACCECORY", "BAG", "BEAUTY", "LIFESTYLE", "SPORTS", "OTHER"];

const initialForm = {
  productType: "CLOTHING",
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
};
// ============================================================================

export default function BrandProductForm({ productId }: Props) {
  const router = useRouter();
  const isEdit = !!productId;

  const [form, setForm] = useState(initialForm);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // ─── Load categories ────────────────────────────────────────────────────────
  const { data: catData } = useQuery(GET_CATEGORIES, {
    variables: { input: { page: 1, limit: 100, sort: "createdAt", direction: "DESC" } }
  });
  const categories = (catData as T)?.getCategories?.list?.filter(
    (c: any) => c.categoryStatus === "ACTIVE"
  ) ?? [];

  // ─── Load existing product for edit ─────────────────────────────────────────
  const { data: prodData, loading: loadingProduct } = useQuery(GET_BRAND_PRODUCTS, {
    skip: !isEdit,
    fetchPolicy: "network-only",
    variables: {
      input: { page: 1, limit: 1, search: {} }
    }
  });

  useEffect(() => {
    if (!isEdit || !prodData) return;
    const products = (prodData as T)?.getBrandProducts?.products ?? [];
    const product = products.find((p: any) => p._id === productId);
    if (!product) return;

    setForm({
      productType: product.productType || "CLOTHING",
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
    setImageUrls(product.productImages || []);
  }, [isEdit, prodData, productId]);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);

  // ─── Image handling ─────────────────────────────────────────────────────────
  const handleImageDrop = useCallback((files: File[]) => {
    setImageFiles((prev) => [...prev, ...files]);
    // Preview new files
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Form change ───────────────────────────────────────────────────────────
  const handleChange = (field: string) => (e: any) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

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
    if (!form.productSize.trim()) {
      await sweetMixinErrorAlert("Product size is required.");
      return;
    }
    if (!form.productColor.trim()) {
      await sweetMixinErrorAlert("Product color is required.");
      return;
    }
    if (imageUrls.length === 0) {
      await sweetMixinErrorAlert("At least one product image is required.");
      return;
    }

    try {
      const productImages = imageUrls.filter((url) => !url.startsWith("data:"));
      // TODO: Upload new image files to server and get URLs
      // For now, include data URLs (your upload logic here)
      const allImages = [...productImages, ...imageUrls.filter((url) => url.startsWith("data:"))];

      const input: any = {
        productType: form.productType,
        productTitle: form.productTitle.trim(),
        productPrice: Number(form.productPrice),
        productImages: allImages,
        productSize: form.productSize.trim(),
        productColor: form.productColor.trim()
      };

      if (form.productCategoryId) input.productCategoryId = form.productCategoryId;
      if (form.productDiscountPrice) input.productDiscountPrice = Number(form.productDiscountPrice);
      if (form.productStockQuantity) input.productStockQuantity = Number(form.productStockQuantity);
      if (form.productDesc?.trim()) input.productDesc = form.productDesc.trim();
      if (form.productMaterials?.trim()) input.productMaterials = form.productMaterials.trim();

      if (isEdit) {
        input._id = productId;
        await updateProduct({ variables: { input } });
        await sweetTopSmallSuccessAlert("Product updated");
      } else {
        await createProduct({ variables: { input } });
        await sweetTopSmallSuccessAlert("Product created");
      }
      router.push("/brand/products");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to save product");
    }
  };

  const saving = creating || updating;

  if (isEdit && loadingProduct) {
    return (
      <PageWrapper title="Edit Product">
        <Typography>Loading product...</Typography>
      </PageWrapper>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title={isEdit ? "Edit Product" : "Add New Product"}>
      <Card sx={{ p: 3 }}>
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

          {/* Type & Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
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

          <Grid size={{ xs: 12, sm: 6 }}>
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
            <TextField
              fullWidth
              label="Size"
              value={form.productSize}
              onChange={handleChange("productSize")}
              required
              placeholder="e.g. S, M, L, XL or 250ml"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Color"
              value={form.productColor}
              onChange={handleChange("productColor")}
              required
              placeholder="e.g. Black, White, Red"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              label="Materials"
              value={form.productMaterials}
              onChange={handleChange("productMaterials")}
              placeholder="e.g. Cotton, Polyester"
            />
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
              onChange={handleImageDrop}
              info="Upload product images (PNG, JPG, GIF)"
            />

            {imageUrls.length > 0 && (
              <FlexBox gap={1} mt={2} flexWrap="wrap">
                {imageUrls.map((url, idx) => (
                  <UploadImageBox key={idx}>
                    <Image
                      fill
                      src={url}
                      alt={`product-${idx}`}
                      sizes="70px"
                      style={{ objectFit: "cover" }}
                    />
                    <StyledClear onClick={() => handleRemoveImage(idx)} />
                  </UploadImageBox>
                ))}
              </FlexBox>
            )}
          </Grid>

          {/* Actions */}
          <Grid size={{ xs: 12 }}>
            <FlexBox gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push("/brand/products")}
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
    </PageWrapper>
  );
}
