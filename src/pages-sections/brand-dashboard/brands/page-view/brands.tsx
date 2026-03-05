"use client";

import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";
// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";
// LOCAL CUSTOM COMPONENT
import BrandRow from "../brand-row";
import SearchArea from "../../search-box";
import PageWrapper from "../../page-wrapper";
// CUSTOM DATA MODEL
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useQuery } from "lib/hooks/useQuery";
import { GET_BRANDS } from "../../../../apollo/user/query";
import { T } from "lib/types/common";

// =============================================================================
type Props = { brands?: any[] };
type BrandRowModel = {
  id: string;
  slug: string;
  name: string;
  logo: string;
  featured: boolean;
};
// =============================================================================

const PAGE_SIZE = 20;

export default function BrandsPageView({ brands }: Props) {
  const { data, loading } = useQuery(GET_BRANDS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: {}
      }
    }
  });

  const list = (data as T)?.getBrands?.brands ?? brands ?? [];

  // RESHAPE THE PRODUCT LIST BASED TABLE HEAD CELL ID
  const filteredBrands: BrandRowModel[] = list.map((item: any) => ({
    id: item._id ?? item.id,
    slug: item._id ?? item.slug ?? "",
    name: item.brandName ?? item.name ?? "Unknown",
    logo:
      item.brandLogo && String(item.brandLogo).trim().length > 0
        ? item.brandLogo
        : "/assets/images/avatars/avatar-1.png",
    featured: item.brandStatus ? item.brandStatus === "ACTIVE" : !!item.featured
  }));

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: filteredBrands, defaultSort: "name" });

  return (
    <PageWrapper title="Product Brands">
      <SearchArea
        buttonText="Add Brand"
        url="/admin/brands/create"
        searchPlaceholder="Search Brand..."
      />

      {loading ? (
        <Typography variant="body1">Loading brands...</Typography>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((brand) => (
                    <BrandRow key={brand.id} brand={brand} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.ceil(filteredList.length / rowsPerPage)}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
