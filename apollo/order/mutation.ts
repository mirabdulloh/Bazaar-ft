import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      _id
      orderStatus
      orderTotalPrice
      orderFinalPrice
      orderPaymentMethod
      createdAt
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId) {
      _id
      orderStatus
      updatedAt
    }
  }
`;
