import { Suspense } from "react";
import type { Metadata } from "next";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import VerifyEmailPageView from "pages-sections/sessions/page-view/verify-email";

export const metadata: Metadata = {
  title: "Verify Email - BAZAAR",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      }
    >
      <VerifyEmailPageView />
    </Suspense>
  );
}
