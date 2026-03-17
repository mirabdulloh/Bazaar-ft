import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
// GLOBAL CUSTOM COMPONENT
import FlexBox from "components/flex-box/flex-box";
// STYLED COMPONENTS
import { StatusWrapper, StyledTableCell, StyledTableRow } from "../styles";

// ========================================================================
type Props = {
  brand: any;
  onApprove: (brand: any) => void;
  onActivate: (brand: any) => void;
  onInactivate: (brand: any) => void;
  onSuspend: (brand: any) => void;
};
// ========================================================================

function resolveBrandLogo(brandLogo?: string | null): string {
  if (!brandLogo || brandLogo === "null" || brandLogo === "undefined") return "";
  if (brandLogo.startsWith("http://") || brandLogo.startsWith("https://")) return brandLogo;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const normalized = brandLogo.startsWith("/") ? brandLogo : `/${brandLogo}`;
  return apiBase ? `${apiBase}${normalized}` : normalized;
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

export default function BrandRow({ brand, onApprove, onActivate, onInactivate, onSuspend }: Props) {
  const { brandName, brandLogo, brandStatus, brandRating, brandFollowersCount, brandReviewsCount, createdAt } = brand;
  const resolvedBrandLogo = resolveBrandLogo(brandLogo);

  const actionButtons = (() => {
    switch (brandStatus) {
      case "PENDING":
        return (
          <>
            <Button size="small" variant="contained" color="success" onClick={() => onApprove(brand)}>
              Approve
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onSuspend(brand)}>
              Suspend
            </Button>
          </>
        );
      case "ACTIVE":
        return (
          <>
            <Button size="small" variant="outlined" color="warning" onClick={() => onInactivate(brand)}>
              Inactivate
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={() => onSuspend(brand)}>
              Suspend
            </Button>
          </>
        );
      case "INACTIVE":
      case "SUSPENDED":
        return (
          <Button size="small" variant="contained" color="info" onClick={() => onActivate(brand)}>
            Activate
          </Button>
        );
      default:
        return null;
    }
  })();

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {resolvedBrandLogo ? (
            <Box
              sx={{
                width: 40,
                height: 40,
                position: "relative",
                borderRadius: 1,
                overflow: "hidden",
                img: { objectFit: "contain" }
              }}
            >
              <Image fill src={resolvedBrandLogo} alt={brandName} sizes="40px" />
            </Box>
          ) : null}
          <Typography variant="h6">{brandName}</Typography>
        </FlexBox>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={brandStatus}>{brandStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {brandRating?.toFixed(1) ?? "0.0"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {brandFollowersCount ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {brandReviewsCount ?? 0}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {formatDate(createdAt)}
      </StyledTableCell>

      <StyledTableCell align="center">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ "& .MuiButton-root": { minWidth: { xs: "100%", md: "auto" } } }}
        >
          {actionButtons}
        </Stack>
      </StyledTableCell>
    </StyledTableRow>
  );
}
