"use client";

import { useState, useCallback } from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FlexBox from "components/flex-box/flex-box";

// GLOBAL CUSTOM COMPONENTS
import OverlayScrollbar from "components/overlay-scrollbar";
import { TableHeader, TablePagination } from "components/data-table";

// GLOBAL CUSTOM HOOK
import useMuiTable from "hooks/useMuiTable";

// LOCAL CUSTOM COMPONENT
import NotificationRow from "../notification-row";
import PageWrapper from "../../page-wrapper";
import { tableHeading } from "../table-heading";

// APOLLO
import { useMutation } from "@apollo/client/react";
import { useQuery } from "lib/hooks/useQuery";
import { GET_ALL_NOTIFICATIONS_BY_ADMIN } from "../../../../../apollo/admin/query";
import { REMOVE_NOTIFICATION_BY_ADMIN } from "../../../../../apollo/admin/mutation";
import { T } from "lib/types/common";

// ALERTS
import {
  sweetTopSmallSuccessAlert,
  sweetMixinErrorAlert,
  sweetConfirmAlert
} from "lib/sweetAlert";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;
const NOTIF_STATUSES = ["UNREAD", "READ", "ARCHIVED"];
const NOTIF_TYPES = ["ORDER", "REVIEW", "FOLLOW", "SYSTEM", "OTHER"];

// =============================================================================

export default function AdminNotificationsPageView() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // ─── GraphQL ────────────────────────────────────────────────────────────────
  const searchObj: any = {};
  if (statusFilter) searchObj.notificationStatus = statusFilter;
  if (typeFilter) searchObj.notificationType = typeFilter;

  const { data, loading, refetch } = useQuery(GET_ALL_NOTIFICATIONS_BY_ADMIN, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        page: 1,
        limit: PAGE_SIZE,
        sort: "createdAt",
        direction: "DESC",
        ...(Object.keys(searchObj).length > 0 ? { search: searchObj } : {})
      }
    }
  });

  const [removeNotification] = useMutation(REMOVE_NOTIFICATION_BY_ADMIN);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const list = (data as T)?.getAllNotificationsByAdmin?.list ?? [];
  const total = (data as T)?.getAllNotificationsByAdmin?.metaCounter?.total ?? 0;

  const {
    order,
    orderBy,
    rowsPerPage,
    filteredList,
    handleChangePage,
    handleRequestSort
  } = useMuiTable({ listData: list, defaultSort: "createdAt", defaultOrder: "desc" });

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    const confirmed = await sweetConfirmAlert(
      "Remove Notification?",
      "This notification will be permanently removed.",
      "Remove"
    );
    if (!confirmed) return;

    try {
      await removeNotification({ variables: { notificationId: id } });
      await sweetTopSmallSuccessAlert("Notification removed");
      refetch();
    } catch (err: any) {
      await sweetMixinErrorAlert(err.message || "Failed to remove notification");
    }
  }, [removeNotification, refetch]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <PageWrapper title="Notifications">
      {/* Filters */}
      <FlexBox mb={2} gap={2} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {NOTIF_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {NOTIF_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </FlexBox>

      {loading ? (
        <Typography variant="body1">Loading notifications...</Typography>
      ) : list.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No notifications found.</Typography>
        </Card>
      ) : (
        <Card>
          <OverlayScrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHeader
                  order={order}
                  orderBy={orderBy}
                  heading={tableHeading}
                  onRequestSort={handleRequestSort}
                />

                <TableBody>
                  {filteredList.map((notification: any) => (
                    <NotificationRow
                      key={notification._id}
                      notification={notification}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </OverlayScrollbar>

          <Stack alignItems="center" my={4}>
            <TablePagination
              onChange={handleChangePage}
              count={Math.ceil(total / rowsPerPage)}
            />
          </Stack>
        </Card>
      )}
    </PageWrapper>
  );
}
