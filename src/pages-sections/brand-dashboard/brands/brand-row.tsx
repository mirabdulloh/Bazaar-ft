import Image from "next/image";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
// MUI ICON COMPONENTS
import Delete from "@mui/icons-material/Delete";
// GLOBAL CUSTOM COMPONENT
import BazaarSwitch from "components/BazaarSwitch";
import FlexBox from "components/flex-box/flex-box";
// STYLED COMPONENTS
import { StatusWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

// ========================================================================
type Props = {
  brand: any;
  onToggle: (brand: any) => void;
  onDelete: (brand: any) => void;
};
// ========================================================================

export default function BrandRow({ brand, onToggle, onDelete }: Props) {
  const { _id, brandName, brandLogo, brandStatus, brandRating, brandFollowersCount } = brand;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left">
        <FlexBox alignItems="center" gap={1.5}>
          {brandLogo ? (
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
              <Image fill src={brandLogo} alt={brandName} sizes="40px" />
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

      <StyledTableCell align="center">
        <BazaarSwitch
          color="info"
          checked={brandStatus === "ACTIVE"}
          onChange={() => onToggle(brand)}
        />
      </StyledTableCell>

      <StyledTableCell align="center">
        <StyledIconButton onClick={() => onDelete(brand)}>
          <Delete />
        </StyledIconButton>
      </StyledTableCell>
    </StyledTableRow>
  );
}
