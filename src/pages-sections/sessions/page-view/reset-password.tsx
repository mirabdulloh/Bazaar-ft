"use client";

import { Fragment, Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
// MUI
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
// GLOBAL CUSTOM COMPONENTS
import { TextField, FormProvider } from "components/form-hook";
import FlexRowCenter from "components/flex-box/flex-row-center";
// LOCAL CUSTOM COMPONENTS
import BoxLink from "../components/box-link";
import EyeToggleButton from "../components/eye-toggle-button";
import usePasswordVisible from "../use-password-visible";
// MUTATIONS
import { FORGOT_PASSWORD, RESET_PASSWORD } from "../../../../apollo/user/mutation";
// ALERTS
import { sweetTopSmallErrorAlert } from "lib/sweetAlert";

// ─── Step 1: request reset email ─────────────────────────────────────────────

const emailSchema = yup.object().shape({
  email: yup.string().email("Invalid email address").required("Email is required")
});

function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const [forgotPassword] = useMutation(FORGOT_PASSWORD);

  const methods = useForm({
    defaultValues: { email: "" },
    resolver: yupResolver(emailSchema)
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const handleSubmitForm = handleSubmit(async (values: { email: string; }) => {
    try {
      await forgotPassword({ variables: { input: values.email } });
      setSent(true);
    } catch (err: any) {
      await sweetTopSmallErrorAlert(err?.message ?? "Something went wrong. Please try again.");
    }
  });

  if (sent) {
    return (
      <Fragment>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 3, textAlign: "center" }}>
          Check your email
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          We&apos;ve sent a password reset link to your email address. The link expires in 1 hour.
        </Alert>
        <FlexRowCenter mt={2} justifyContent="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Back to
          </Typography>
          <BoxLink title="Login" href="/login" />
        </FlexRowCenter>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
        Forgot password?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Enter your email and we&apos;ll send you a reset link.
      </Typography>

      <FormProvider methods={methods} onSubmit={handleSubmitForm}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            name="email"
            type="email"
            label="Email Address"
            size="medium"
            placeholder="you@example.com"
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            loading={isSubmitting}
          >
            Send Reset Link
          </Button>
        </Stack>
      </FormProvider>

      <FlexRowCenter mt={3} justifyContent="center" gap={1}>
        <Typography variant="body1" color="text.secondary">
          Remembered your password?
        </Typography>
        <BoxLink title="Login" href="/login" />
      </FlexRowCenter>
    </Fragment>
  );
}

// ─── Step 2: set new password ─────────────────────────────────────────────────

const newPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(7, "Min 7 characters")
    .max(20, "Max 20 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password")
});

function SetNewPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();
  const [done, setDone] = useState(false);

  const [resetPassword] = useMutation(RESET_PASSWORD);

  const methods = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: yupResolver(newPasswordSchema)
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const handleSubmitForm = handleSubmit(async (values: { password: string; confirmPassword: string }) => {
    try {
      await resetPassword({ variables: { token, newPassword: values.password } });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      await sweetTopSmallErrorAlert(err?.message ?? "Invalid or expired reset link.");
    }
  });

  if (done) {
    return (
      <Fragment>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 3, textAlign: "center" }}>
          Password updated!
        </Typography>
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password has been reset successfully. Redirecting to login...
        </Alert>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 1, textAlign: "center" }}>
        Set new password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
        Choose a strong password for your account.
      </Typography>

      <FormProvider methods={methods} onSubmit={handleSubmitForm}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            size="medium"
            name="password"
            label="New Password"
            placeholder="*********"
            type={visiblePassword ? "text" : "password"}
            slotProps={{
              input: {
                endAdornment: <EyeToggleButton show={visiblePassword} click={togglePasswordVisible} />
              }
            }}
          />

          <TextField
            fullWidth
            size="medium"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="*********"
            type={visiblePassword ? "text" : "password"}
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            loading={isSubmitting}
          >
            Update Password
          </Button>
        </Stack>
      </FormProvider>
    </Fragment>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function ResetPasswordRouter() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return token ? <SetNewPasswordForm token={token} /> : <ForgotPasswordForm />;
}

export default function ResetPassword() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordRouter />
    </Suspense>
  );
}
