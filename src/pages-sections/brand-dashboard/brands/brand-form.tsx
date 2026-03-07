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
import { GET_ALL_BRANDS_BY_ADMIN } from "../../../../apollo/admin/query";
import { UPDATE_BRAND_BY_ADMIN } from "../../../../apollo/admin/mutation";
import { T } from "lib/types/common";
// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert
} from "lib/sweetAlert";

const BRAND_STATUSES = ["ACTIVE", "INACTIVE", "DELETED"];

// ================================================================
interface Props {
  brandId?: string;
}
// ================================================================

export default function BrandForm({ brandId }: Props) {
  const [brandName, setBrandName] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandStatus, setBrandStatus] = useState("ACTIVE");
  const [saving, setSaving] = useState(false);

  // ─── Load brand data when editing ─────────────────────────────────────────
  const { data, loading } = useQuery(GET_ALL_BRANDS_BY_ADMIN, {
    skip: !brandId,
    fetchPolicy: "network-only",
    variables: {
      input: { page: 1, limit: 100, sort: "createdAt", direction: "DESC" }
    }
  });

  useEffect(() => {
    if (!brandId || !data) return;
    const brands = (data as T)?.getAllBrandsByAdmin?.brands ?? [];
    const brand = brands.find((b: any) => b._id === brandId);
    if (brand) {
      setBrandName(brand.brandName || "");
      setBrandDesc(brand.brandDesc || "");
      setBrandStatus(brand.brandStatus || "ACTIVE");
    }
  }, [data, brandId]);

  const [updateBrand] = useMutation(UPDATE_BRAND_BY_ADMIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      await sweetMixinErrorAlert("Brand name is required");
      return;
    }
    if (!brandId) {
      await sweetMixinErrorAlert("Brand creation is handled through brand registration");
      return;
    }

    setSaving(true);
    try {
      await updateBrand({
        variables: {
          input: {
            _id: brandId,
            brandName: brandName.trim(),
            brandDesc: brandDesc.trim(),
            brandStatus
          }
        }
      });
      await sweetTopSmallSuccessAlert("Brand updated successfully");
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to update brand");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Typography>Loading brand...</Typography>;

  return (
    <Card className="p-3">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={12}>
            <MuiTextField
              fullWidth
              label="Brand Name"
              color="info"
              size="medium"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand Name"
            />
          </Grid>

          <Grid size={12}>
            <MuiTextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              color="info"
              size="medium"
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              placeholder="Brand description"
            />
          </Grid>

          {brandId && (
            <Grid size={{ sm: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={brandStatus}
                  label="Status"
                  onChange={(e) => setBrandStatus(e.target.value)}
                >
                  {BRAND_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid size={12}>
            <Button
              disabled={saving || !brandId}
              variant="contained"
              color="info"
              type="submit"
            >
              {saving ? "Saving..." : "Save Brand"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Card>
  );
}
