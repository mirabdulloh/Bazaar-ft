import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import PageWrapper from "../../page-wrapper";

export default function ProductCreatePageView() {
  return (
    <PageWrapper title="Add New Product">
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>Product Creation</Typography>
        <Typography color="text.secondary">
          Products are created and managed by brands from their own dashboard.
          As admin, you can view and remove products from the Product List page.
        </Typography>
      </Card>
    </PageWrapper>
  );
}
