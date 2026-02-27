import { gql } from "@apollo/client";

const ORDER_ITEM_FRAGMENT = `
  _id
  orderId
  productId
  priceAtPurchase
  itemQuantity
  subtotal
  product {
    _id
    productTitle
    productImages
    productPrice
  }
`;

const ORDER_FRAGMENT = `
  _id
  memberId
  orderStatus
  orderTotalPrice
  orderTotalDiscountPrice
  orderFinalPrice
  orderPaymentMethod
  orderPaymentStatus
  orderDeliveryStatus
  orderDeliveryAddressId
  createdAt
  updatedAt
`;

export const GET_ORDER = gql`
  query GetOrder($orderId: String!) {
    getOrder(orderId: $orderId) {
      ${ORDER_FRAGMENT}
      deliveryAddress {
        _id
        addressName
        addressLine1
        addressLine2
        addressCity
        addressCountry
        addressZipCode
      }
      orderItems {
        ${ORDER_ITEM_FRAGMENT}
      }
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: MyOrdersInquiry!) {
    getMyOrders(input: $input) {
      list {
        ${ORDER_FRAGMENT}
        orderItems {
          ${ORDER_ITEM_FRAGMENT}
        }
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
