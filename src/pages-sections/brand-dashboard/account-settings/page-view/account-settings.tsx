"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
// MUI
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
// LOCAL CUSTOM COMPONENT
import PageWrapper from "../../page-wrapper";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_MY_BRAND } from "../../../../../apollo/brand/query";
import { UPDATE_BRAND } from "../../../../../apollo/brand/mutation";
import { T } from "lib/types/common";
// AUTH
import { getJwtToken, getRefreshToken, setJwtToken, setRefreshToken, setUserFromMemberData } from "lib/auth";
// ALERTS
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from "lib/sweetAlert";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getValidToken(): Promise<string> {
  let token = getJwtToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = (payload.exp ?? 0) * 1000;
      if (Date.now() < expiresAt - 30_000) return token;
    } catch {
      // refresh
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

function resolveImage(apiBase: string, img?: string | null): string {
  if (!img) return "";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalized = img.startsWith("/") ? img : `/${img}`;
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

export default function AccountSettingsPageView() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const { data, loading, refetch } = useQuery(GET_MY_BRAND, {
    fetchPolicy: "cache-and-network",
  });
  const [updateBrand, { loading: updating }] = useMutation(UPDATE_BRAND);

  const brand = (data as T)?.getMyBrand;
  const [brandName, setBrandName] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    if (!brand) return;
    setBrandName(brand.brandName ?? "");
    setBrandDesc(brand.brandDesc ?? "");
    setBrandLogo(brand.brandLogo ?? "");
  }, [brand]);

  const logoPreview = useMemo(() => resolveImage(apiBase, brandLogo), [apiBase, brandLogo]);

  const handleUploadLogo = useCallback(async (file: File) => {
    try {
      setLogoUploading(true);
      const token = await getValidToken();

      const formData = new FormData();
      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
            imagesUploader(files: $files, target: $target)
          }`,
          variables: {
            files: [null],
            target: "members"
          }
        })
      );
      formData.append("map", JSON.stringify({ "0": ["variables.files.0"] }));
      formData.append("0", file);

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

      const uploaded = response.data?.data?.imagesUploader?.[0];
      if (!uploaded) throw new Error("Logo upload failed");
      setBrandLogo(uploaded);
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message || "Failed to upload logo");
    } finally {
      setLogoUploading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!brand?._id) return;
    if (!brandName.trim()) {
      await sweetMixinErrorAlert("Brand name is required.");
      return;
    }
    try {
      await updateBrand({
        variables: {
          input: {
            _id: brand._id,
            brandName: brandName.trim(),
            brandDesc: brandDesc.trim(),
            brandLogo: brandLogo || null
          }
        }
      });
      await sweetTopSmallSuccessAlert("Brand updated");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err?.message || "Failed to update brand");
    }
  }, [brand?._id, brandDesc, brandLogo, brandName, refetch, updateBrand]);

  return (
    <PageWrapper title="Brand Profile">
      <Card sx={{ p: 3 }}>
        {loading && !brand ? (
          <Typography>Loading brand...</Typography>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "grey.50"
                }}
              >
                <Stack alignItems="center" sx={{ textAlign: "center" }}>
                  <Box sx={{ position: "relative", display: "inline-flex" }}>
                    <Avatar
                      src={logoPreview}
                      alt={brandName}
                      sx={{ width: 110, height: 110, mb: 1.5 }}
                    />
                    {logoUploading && (
                      <CircularProgress
                        size={36}
                        sx={{ position: "absolute", top: 36, left: 36 }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" fontWeight={700}>
                    {brandName || "Your Brand"}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                  <Chip
                    size="small"
                    label={brand?.brandStatus ?? "PENDING"}
                    color={brand?.brandStatus === "ACTIVE" ? "success" : "warning"}
                  />
                  <Chip size="small" label={`Rating ${brand?.brandRating?.toFixed(1) ?? "0.0"}`} />
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5, gap: 1 }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    Website Card Preview
                  </Typography>
                  <Button
                    size="small"
                    component="label"
                    variant="outlined"
                    disabled={logoUploading}
                  >
                    Upload Logo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLogo(file);
                      }}
                    />
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                  This preview matches the storefront brand card image and text layout.
                </Typography>

                <Card
                  variant="outlined"
                  sx={{
                    overflow: "hidden",
                    borderRadius: 3,
                    bgcolor: "common.white",
                  }}
                >
                  {logoPreview ? (
                    <Box
                      sx={{
                        height: 180,
                        backgroundImage: `url(${logoPreview})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                        bgcolor: "grey.100",
                      }}
                    />
                  ) : (
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{ height: 180, bgcolor: "grey.100" }}
                    >
                      <Avatar alt={brandName} sx={{ width: 72, height: 72, fontSize: 28 }}>
                        {(brandName || "B")?.[0]}
                      </Avatar>
                    </Stack>
                  )}

                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight={700} noWrap>
                      {brandName || "Your Brand"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                        minHeight: 42,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {brandDesc || "Your brand description will appear here on the website card."}
                    </Typography>
                  </Box>
                </Card>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Brand Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Brand Name"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label="Brand Description"
                      value={brandDesc}
                      onChange={(e) => setBrandDesc(e.target.value)}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        color="info"
                        onClick={handleSave}
                        disabled={updating || logoUploading}
                        startIcon={updating ? <CircularProgress size={18} /> : undefined}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outlined" onClick={() => refetch()}>
                        Reset
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        )}
      </Card>
    </PageWrapper>
  );
}
