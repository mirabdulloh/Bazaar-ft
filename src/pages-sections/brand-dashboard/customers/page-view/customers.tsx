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
import SearchArea from "../../search-box";
import CustomerRow from "../customer-row";
import PageWrapper from "../../page-wrapper";
// TABLE HEAD COLUMN DATA
import { tableHeading } from "../table-heading";
// APOLLO
import { useQuery } from "lib/hooks/useQuery";
import { GET_MEMBERS } from "../../../../../apollo/user/query";
import { T } from "lib/types/common";

// =============================================================================
type Props = { customers?: any[] };

type MemberRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  balance: number;
  orders: number;
};
// =============================================================================

const PAGE_SIZE = 20;

export default function CustomersPageView({ customers }: Props) {
  const { data, loading } = useQuery(GET_MEMBERS, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        search: { memberType: "USER" }
      }
    }
  });

  const list = (data as T)?.getMembers?.members ?? customers ?? [];

  const mapped: MemberRow[] = list.map((m: any) => ({
    id: m._id ?? m.id,
    name: m.memberNick ?? m.name ?? "Unknown",
    phone: m.memberPhone ?? m.phone ?? "-",
    email: m.memberEmail ?? m.email ?? "-",
    avatar:
      m.memberImage && String(m.memberImage).trim().length > 0
        ? m.memberImage
        : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(m.memberNick ?? "U")}&backgroundColor=6366f1&textColor=ffffff`,
    balance: m.memberPoints ?? m.balance ?? 0,
    orders: m.memberComments ?? m.orders ?? 0
  }));

  const { order, orderBy, rowsPerPage, filteredList, handleChangePage, handleRequestSort } =
    useMuiTable({ listData: mapped });

  return (
    <PageWrapper title="Customers">
      <SearchArea
        buttonText="Add Customer"
        url="/admin/customers"
        searchPlaceholder="Search Customer..."
      />

      {loading ? (
        <Typography variant="body1">Loading customers...</Typography>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 900 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((customer) => (
                    <CustomerRow customer={customer} key={customer.id} />
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
