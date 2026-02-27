"use client";

import Button from "@mui/material/Button";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
// GLOBAL CUSTOM COMPONENTS
import { TextField, FormProvider } from "components/form-hook";
// LOCAL CUSTOM COMPONENTS
import Label from "../components/label";
import EyeToggleButton from "../components/eye-toggle-button";
// LOCAL CUSTOM HOOK
import usePasswordVisible from "../use-password-visible";
// AUTH
import { logIn } from "lib/auth";

// LOGIN FORM FIELD VALIDATION SCHEMA
const validationSchema = yup.object().shape({
  nick: yup.string().min(3, "Min 3 characters").max(12, "Max 12 characters").required("Nickname is required"),
  password: yup.string().min(7, "Min 7 characters").max(20, "Max 20 characters").required("Password is required")
});

export default function LoginPageView() {
  const router = useRouter();
  const { visiblePassword, togglePasswordVisible } = usePasswordVisible();

  const initialValues = { nick: "", password: "" };

  const methods = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema)
  });

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods;

  const handleSubmitForm = handleSubmit(async (values) => {
    await logIn(values.nick, values.password);
    router.push("/");
  });

  return (
    <FormProvider methods={methods} onSubmit={handleSubmitForm}>
      <div className="mb-1">
        <Label>Nickname</Label>
        <TextField
          fullWidth
          name="nick"
          type="text"
          size="medium"
          placeholder="your_nickname"
        />
      </div>

      <div className="mb-2">
        <Label>Password</Label>
        <TextField
          fullWidth
          size="medium"
          name="password"
          autoComplete="on"
          placeholder="*********"
          type={visiblePassword ? "text" : "password"}
          slotProps={{
            input: {
              endAdornment: <EyeToggleButton show={visiblePassword} click={togglePasswordVisible} />
            }
          }}
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
        Login
      </Button>
    </FormProvider>
  );
}
