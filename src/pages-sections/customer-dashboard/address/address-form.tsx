"use client";

import { useState } from "react";
// MUI
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Box from "@mui/material/Box";
// APOLLO
import { useMutation } from "@apollo/client/react";
import { CREATE_ADDRESS, UPDATE_ADDRESS } from "../../../../apollo/user/mutation";
// UTILS
import { sweetMixinErrorAlert } from "lib/sweetAlert";
import { T } from "../../../lib/types/common";

// ==============================================================
type Props = { address: T | null; onSuccess: () => void; onCancel: () => void };
// ==============================================================

type FormState = {
  addressName: string;
  addressPhone: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressZipCode: string;
  addressCountry: string;
  isDefault: boolean;
};

function emptyForm(): FormState {
  return {
    addressName: "",
    addressPhone: "",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressZipCode: "",
    addressCountry: "",
    isDefault: false,
  };
}

function fromAddress(addr: T): FormState {
  return {
    addressName: (addr.addressName as string) ?? "",
    addressPhone: (addr.addressPhone as string) ?? "",
    addressLine1: (addr.addressLine1 as string) ?? "",
    addressLine2: (addr.addressLine2 as string) ?? "",
    addressCity: (addr.addressCity as string) ?? "",
    addressZipCode: (addr.addressZipCode as string) ?? "",
    addressCountry: (addr.addressCountry as string) ?? "",
    isDefault: (addr.isDefault as boolean) ?? false,
  };
}

export default function AddressForm({ address, onSuccess, onCancel }: Props) {
  const isEdit = !!address?._id;
  const [form, setForm] = useState<FormState>(address ? fromAddress(address) : emptyForm());
  const [saving, setSaving] = useState(false);

  const [createAddress] = useMutation(CREATE_ADDRESS);
  const [updateAddress] = useMutation(UPDATE_ADDRESS);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required: (keyof FormState)[] = [
      "addressName",
      "addressPhone",
      "addressLine1",
      "addressCity",
      "addressZipCode",
      "addressCountry",
    ];
    for (const key of required) {
      if (!String(form[key]).trim()) {
        sweetMixinErrorAlert(`${key.replace("address", "")} is required.`);
        return;
      }
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateAddress({
          variables: {
            input: {
              _id: String(address!._id),
              addressName: form.addressName,
              addressPhone: form.addressPhone,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2 || undefined,
              addressCity: form.addressCity,
              addressZipCode: form.addressZipCode,
              addressCountry: form.addressCountry,
              isDefault: form.isDefault,
            },
          },
        });
      } else {
        await createAddress({
          variables: {
            input: {
              addressName: form.addressName,
              addressPhone: form.addressPhone,
              addressLine1: form.addressLine1,
              addressLine2: form.addressLine2 || undefined,
              addressCity: form.addressCity,
              addressZipCode: form.addressZipCode,
              addressCountry: form.addressCountry,
              isDefault: form.isDefault,
            },
          },
        });
      }
      onSuccess();
    } catch (err: any) {
      sweetMixinErrorAlert(err.message ?? "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Label (e.g. Home, Work)"
            value={form.addressName}
            onChange={set("addressName")}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label="Phone"
            value={form.addressPhone}
            onChange={set("addressPhone")}
            required
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Address Line 1"
            value={form.addressLine1}
            onChange={set("addressLine1")}
            required
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            size="small"
            label="Address Line 2 (optional)"
            value={form.addressLine2}
            onChange={set("addressLine2")}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="City"
            value={form.addressCity}
            onChange={set("addressCity")}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="ZIP / Postal Code"
            value={form.addressZipCode}
            onChange={set("addressZipCode")}
            required
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Country"
            value={form.addressCountry}
            onChange={set("addressCountry")}
            required
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={form.isDefault}
                onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                size="small"
                color="primary"
              />
            }
            label="Set as default address"
          />
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" loading={saving}>
              {isEdit ? "Save Changes" : "Add Address"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
