import { styled, keyframes, alpha } from "@mui/material/styles";

const headerHeight = 72;

const slideFromTop = keyframes`
from { top: -${headerHeight}px; }
to { top: 0; }`;

// STYLED COMPONENT
export const HeaderWrapper = styled("div")(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  background: `linear-gradient(135deg, 
  ${alpha(theme.palette.primary.main, 0.02)} 0%, 
  ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
  "& .link": {
    fontWeight: 500,
    cursor: "pointer",
    padding: "0.25rem 1.25rem",
    color: theme.palette.grey[600],
    transition: "color 250ms ease-in-out",
    "&:hover": { color: theme.palette.primary.main }
  },
  "& .fixedHeader": {
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    position: "fixed",
    background: "white",
    height: headerHeight,
    boxShadow: theme.shadows[2],
    animation: `${slideFromTop} 250ms ease-in-out`,
    "& .link": { color: "inherit" }
  },

  [theme.breakpoints.down("sm")]: {
    "& .right-links": { display: "none" },
    "& .purchase-link": { display: "none" }
  }
}));
