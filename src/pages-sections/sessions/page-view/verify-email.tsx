"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import ErrorOutline from "@mui/icons-material/ErrorOutline";
import { useMutation } from "@apollo/client/react";
import { VERIFY_EMAIL } from "../../../../apollo/user/mutation";
import { updateStorage, setRefreshToken, setUserFromMemberData } from "lib/auth";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPageView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>("loading");

  const [verifyEmail] = useMutation<{ verifyEmail: { accessToken?: string; refreshToken?: string; [key: string]: any } }>(VERIFY_EMAIL);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    verifyEmail({ variables: { token } })
      .then(({ data }) => {
        const member = data?.verifyEmail;
        if (member?.accessToken) {
          updateStorage({ jwtToken: member.accessToken });
          if (member.refreshToken) setRefreshToken(member.refreshToken);
          setUserFromMemberData(member);
          setStatus("success");
          // Auto-redirect to home after a short delay
          setTimeout(() => router.push("/"), 1500);
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
      px={2}
      textAlign="center"
    >
      {status === "loading" && (
        <>
          <CircularProgress size={56} />
          <Typography variant="h6" color="text.secondary">
            Verifying your email...
          </Typography>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleOutline sx={{ fontSize: 72, color: "success.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Email Verified!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome! Redirecting you to the homepage...
          </Typography>
          <CircularProgress size={24} sx={{ mt: 1 }} />
        </>
      )}

      {status === "error" && (
        <>
          <ErrorOutline sx={{ fontSize: 72, color: "error.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Verification Failed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            The link is invalid or has expired.
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push("/register")}
            sx={{ mt: 1 }}
          >
            Back to Register
          </Button>
        </>
      )}
    </Box>
  );
}
