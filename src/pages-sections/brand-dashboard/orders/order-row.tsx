import { format } from "date-fns/format";
// MUI ICON COMPONENTS
import Visibility from "@mui/icons-material/Visibility";
// CUSTOM UTILS LIBRARY FUNCTION
import { currency } from "lib";
// STYLED COMPONENTS
import { StatusWrapper, StyledIconButton, StyledTableCell, StyledTableRow } from "../styles";

// ─── Types (matching backend enums) ─────────────────────────────────────────
export type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type OrderPaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderDeliveryStatus = "PREPARING" | "SHIPPING" | "DELIVERED";
export type OrderPaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "POINTS";

export interface OrderMember {
  _id: string;
  memberNick: string;
  memberImage?: string;
  memberEmail?: string;
  memberPhone?: string;
}

export interface OrderProductData {
  _id: string;
  productTitle?: string;
  productImages?: string[];
  productPrice?: number;
  productDiscountPrice?: number;
  productSize?: string;
  productColor?: string;
}

export interface OrderItemData {
  _id: string;
  orderId: string;
  productId: string;
  priceAtPurchase: number;
  itemQuantity: number;
  subtotal: number;
  selectedSize?: string;
  selectedColor?: string;
  product?: OrderProductData;
}

export interface OrderAddress {
  _id: string;
  addressName?: string;
  addressPhone?: string;
  addressCountry?: string;
  addressCity?: string;
  addressZipCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  isDefault?: boolean;
}

export interface OrderData {
  _id: string;
  memberId: string;
  brandId: string;
  orderStatus: OrderStatus;
  orderTotalPrice: number;
  orderTotalDiscountPrice: number;
  orderFinalPrice: number;
  orderPaymentMethod: OrderPaymentMethod;
  orderPaymentStatus: OrderPaymentStatus;
  orderDeliveryAddressId: string;
  orderDeliveryStatus: OrderDeliveryStatus;
  createdAt: string;
  updatedAt: string;
  member?: OrderMember;
  deliveryAddress?: OrderAddress;
  orderItems?: OrderItemData[];
}

// ========================================================================
type Props = {
  order: OrderData;
  onView?: (order: OrderData) => void;
};
// ========================================================================

export default function OrderRow({ order, onView }: Props) {
  const {
    _id,
    orderStatus,
    orderPaymentStatus,
    orderDeliveryStatus,
    orderFinalPrice,
    member,
    createdAt
  } = order;

  return (
    <StyledTableRow tabIndex={-1} role="checkbox">
      <StyledTableCell align="left" sx={{ fontWeight: 600 }}>
        #{_id?.slice(0, 8)}
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderStatus}>{orderStatus}</StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderPaymentStatus === "PAID" ? "Accepted" : orderPaymentStatus === "FAILED" ? "Rejected" : "Pending"}>
          {orderPaymentStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left">
        <StatusWrapper status={orderDeliveryStatus === "DELIVERED" ? "Delivered" : orderDeliveryStatus === "SHIPPING" ? "Processing" : "Pending"}>
          {orderDeliveryStatus}
        </StatusWrapper>
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {currency(orderFinalPrice ?? 0)}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {member?.memberNick ?? "-"}
      </StyledTableCell>

      <StyledTableCell align="left" sx={{ fontWeight: 400 }}>
        {createdAt ? format(new Date(createdAt), "dd MMM yyyy") : "-"}
      </StyledTableCell>

      <StyledTableCell align="center">
        {onView && (
          <StyledIconButton onClick={() => onView(order)}>
            <Visibility />
          </StyledIconButton>
        )}
      </StyledTableCell>
    </StyledTableRow>
  );
}
