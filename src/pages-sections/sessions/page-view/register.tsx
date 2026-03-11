"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
// GLOBAL CUSTOM COMPONENTS
import { Checkbox, TextField, FormProvider } from "components/form-hook";
// LOCAL CUSTOM COMPONENTS
import EyeToggleButton from "../components/eye-toggle-button";
// LOCAL CUSTOM HOOK
import Label from "../components/label";
import BoxLink from "../components/box-link";
import usePasswordVisible from "../use-password-visible";
// GLOBAL CUSTOM COMPONENTS
import FlexBox from "components/flex-box/flex-box";
// AUTH
import { signUp } from "lib/auth";

// REGISTER FORM FIELD VALIDATION SCHEMA
type RegisterValues = {
  nick: string;
  email: string;
  phone: string;
  password: string;
  re_password: string;
  agreement: boolean | undefined;
  accountType: "USER" | "BRAND";
};

const validationSchema = yup.object().shape({
  nick: yup.string().min(3, "Min 3 characters").max(25, "Max 25 characters").required("Name is required"),
  email: yup.string().email("Enter a valid email address").required("Email is required"),
  phone: yup.string().matches(/^\+?[0-9]{7,15}$/, "Digits only, e.g. +821012345678").required("Phone number is required"),
  password: yup.string().min(7, "Min 7 characters").max(20, "Max 20 characters").required("Password is required"),
  re_password: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please re-type password"),
  accountType: yup.mixed<"USER" | "BRAND">().oneOf(["USER", "BRAND"]).required("Account type is required"),
  agreement: yup
    .bool()
    .test(
      "agreement",
      "You have to agree with our Terms and Conditions!",
      (value) => value === true
    )
    .required("You have to agree with our Terms and Conditions!")
});

export default function RegisterPageView() {
  const router = useRouter();
  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();

  const inputProps = {
    endAdornment: <EyeToggleButton show={visiblePassword} click={togglePasswordVisible} />
  };

  const initialValues = {
    nick: "",
    email: "",
    phone: "",
    password: "",
    re_password: "",
    agreement: false,
    accountType: "USER" as const
  };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema)
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const accountType = methods.watch("accountType");

  const handleSubmitForm = handleSubmit(async (values: RegisterValues) => {
    try {
      const { isPending } = await signUp(values.nick, values.password, values.phone, values.accountType, values.email);
      // Pending = email sent, send them to login page to wait
      // Not pending = signed up without email, auto-logged in, go home
      router.push(isPending ? "/login" : "/");
    } catch {
      // Error alert is shown inside signUp — just stay on the register page
    }
  });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmitForm}>
      <div className="mb-1">
        <Label>Full Name</Label>
        <TextField fullWidth name="nick" size="medium" placeholder="Your name" />
      </div>

      <div className="mb-1">
        <Label>Email Address</Label>
        <TextField fullWidth name="email" size="medium" type="email" placeholder="you@example.com" />
      </div>

      <div className="mb-1">
        <Label>Phone Number</Label>
        <TextField
          fullWidth
          name="phone"
          size="medium"
          type="text"
          placeholder="+821012345678"
        />
      </div>

      <div className="mb-1">
        <Label>Account Type</Label>
        <TextField fullWidth name="accountType" size="medium" select>
          <MenuItem value="USER">User</MenuItem>
          <MenuItem value="BRAND">Brand</MenuItem>
        </TextField>
        {accountType === "BRAND" && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            Brand accounts require admin approval. You can shop as a user until approved.
          </Typography>
        )}
      </div>

      <div className="mb-1">
        <Label>Password</Label>
        <TextField
          fullWidth
          size="medium"
          name="password"
          placeholder="*********"
          type={visiblePassword ? "text" : "password"}
          slotProps={{ input: inputProps }}
        />
      </div>

      <div className="mb-1">
        <Label>Retype Password</Label>
        <TextField
          fullWidth
          size="medium"
          name="re_password"
          placeholder="*********"
          type={visiblePassword ? "text" : "password"}
          slotProps={{ input: inputProps }}
        />
      </div>

      <div className="agreement">
        <Checkbox
          name="agreement"
          size="small"
          color="secondary"
          label={
            <FlexBox flexWrap="wrap" alignItems="center" justifyContent="flex-start" gap={1}>
              <Box display={{ sm: "inline-block", xs: "none" }}>By signing up, you agree to</Box>
              <Box display={{ sm: "none", xs: "inline-block" }}>Accept Our</Box>
              <BoxLink title="Terms & Condition" href="/" />
            </FlexBox>
          }
        />
      </div>

      <Button
        fullWidth
        size="large"
        type="submit"
        color="primary"
        variant="contained"
        loading={isSubmitting}
      >
        Create an Account
      </Button>
    </FormProvider>
  );
}
