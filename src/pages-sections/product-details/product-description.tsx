import Typography from "@mui/material/Typography";

type Props = {
  description?: string;
};

export default function ProductDescription({ description }: Props) {
  return (
    <div>
      <Typography variant="h3" sx={{ mb: 2 }}>
        Specification:
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
        {description?.trim() || "No product description available."}
      </Typography>
    </div>
  );
}
