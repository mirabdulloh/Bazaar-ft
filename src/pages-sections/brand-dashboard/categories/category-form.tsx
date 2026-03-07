"use client";

import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import MuiTextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_CATEGORIES_BY_ADMIN } from "../../../../apollo/admin/query";
import { CREATE_CATEGORY, UPDATE_CATEGORY } from "../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

const CATEGORY_STATUSES = ["ACTIVE", "INACTIVE"];

// ================================================================
interface Props {
  categoryId?: string;
}
// ================================================================

export default function CategoryForm({ categoryId }: Props) {
  const [categoryName, setCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  // ─── Load all categories (for parent dropdown + editing) ─────────────────
  const { data, loading } = useQuery(GET_ALL_CATEGORIES_BY_ADMIN, {
    fetchPolicy: "network-only",
    variables: {
      input: { page: 1, limit: 100, sort: "createdAt", direction: "DESC" }
    }
  });

  const allCategories = (data as T)?.getAllCategoriesByAdmin?.list ?? [];

  // ─── Populate form when editing ──────────────────────────────────────────
  useEffect(() => {
    if (!categoryId || !data) return;
    const category = allCategories.find((c: any) => c._id === categoryId);
    if (category) {
      setCategoryName(category.categoryName || "");
      setParentCategoryId(category.parentCategoryId || "");
      setCategoryStatus(category.categoryStatus || "ACTIVE");
    }
  }, [data, categoryId]);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      await sweetMixinErrorAlert("Category name is required");
      return;
    }

    setSaving(true);
    try {
      if (categoryId) {
        // UPDATE
        await updateCategory({
          variables: {
            input: {
              _id: categoryId,
              categoryName: categoryName.trim(),
              ...(parentCategoryId ? { parentCategoryId } : {}),
              categoryStatus
            }
          }
        });
        await sweetTopSmallSuccessAlert("Category updated successfully");
      } else {
        // CREATE
        await createCategory({
          variables: {
            input: {
              categoryName: categoryName.trim(),
              ...(parentCategoryId ? { parentCategoryId } : {})
            }
          }
        });
        await sweetTopSmallSuccessAlert("Category created successfully");
        setCategoryName("");
        setParentCategoryId("");
        setCategoryStatus("ACTIVE");
      }
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  // Filter out current category from parent dropdown (can't be its own parent)
  const parentOptions = allCategories.filter((c: any) => c._id !== categoryId);

  return (
    <Card className="p-3">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ sm: 6, xs: 12 }}>
            <MuiTextField
              fullWidth
              label="Category Name"
              color="info"
              size="medium"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category Name"
            />
          </Grid>

          <Grid size={{ sm: 6, xs: 12 }}>
            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={parentCategoryId}
                label="Parent Category"
                onChange={(e) => setParentCategoryId(e.target.value)}
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {parentOptions.map((cat: any) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {categoryId && (
            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={categoryStatus}
                  label="Status"
                  onChange={(e) => setCategoryStatus(e.target.value)}
                >
                  {CATEGORY_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid size={12}>
            <Button
              disabled={saving}
              variant="contained"
              color="info"
              type="submit"
            >
              {saving ? "Saving..." : categoryId ? "Save Category" : "Create Category"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
}
