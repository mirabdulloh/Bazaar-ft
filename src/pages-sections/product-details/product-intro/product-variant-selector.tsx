"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

type Props = {
  sizes?: string[];
  colors?: string[];
};

type VariantGroup = {
  title: string;
  values: string[];
};

export default function ProductVariantSelector({ sizes = [], colors = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const groups: VariantGroup[] = [
    { title: "Size", values: sizes },
    { title: "Color", values: colors }
  ].filter((group) => group.values.length > 0);

  if (groups.length === 0) return null;

  return groups.map((variant) => (
    <div className="mb-1" key={variant.title}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {variant.title}
      </Typography>

      <div className="variant-group">
        {variant.values.map((value) => {
          const variantNameLowerCase = variant.title.toLowerCase();

          // Base variant params on current params so we can preserve any other param state in the url.
          const optionSearchParams = new URLSearchParams(searchParams);

          // Update the variant params using the current variant to reflect how the url *would* change,
          // if the variant was clicked.
          optionSearchParams.set(variantNameLowerCase, value);

          const optionUrl = () => {
            router.push(`${pathname}?${optionSearchParams}`, { scroll: false });
          };

          // The variant is active if it's in the url params.
          const isActive = searchParams.get(variantNameLowerCase) === value;

          return (
            <Chip
              key={`${variant.title}-${value}`}
              label={value}
              size="small"
              color="primary"
              onClick={optionUrl}
              variant={isActive ? "filled" : "outlined"}
            />
          );
        })}
      </div>
    </div>
  ));
}
