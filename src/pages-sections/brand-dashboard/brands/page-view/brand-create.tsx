import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import PageWrapper from "../../page-wrapper";

export default function CreateBrandPageView() {
  return (
    <PageWrapper title="Create New Brand">
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>Brand Registration</Typography>
        <Typography color="text.secondary">
          Brands are created through the brand registration process.
          To manage existing brands, go to the Brand List page.
        </Typography>
      </Card>
    </PageWrapper>
  );
}
