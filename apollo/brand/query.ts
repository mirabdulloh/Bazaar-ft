import { gql } from "@apollo/client";

// ─── Brand Profile ────────────────────────────────────────────────────────────

export const GET_MY_BRAND = gql`
  query GetMyBrand {
    getMyBrand {
      _id
      brandName
      brandLogo
      brandDesc
      brandStatus
      brandRating
      brandFollowersCount
      brandReviewsCount
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Brand Products ───────────────────────────────────────────────────────────

export const GET_BRAND_PRODUCTS = gql`
  query GetBrandProducts($input: BrandProductsInquiry!) {
    getBrandProducts(input: $input) {
      products {
        _id
        memberId
        productType
        productCategoryId
        productStatus
        productTitle
        productPrice
        productDiscountPrice
        productViews
        productLikes
        productComments
        productRank
        productImages
        productRatingAverage
        productRatingCount
        productStockQuantity
        productDesc
        productSize
        productColor
        productMaterials
        createdAt
        updatedAt
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;

// ─── Brand Coupons ────────────────────────────────────────────────────────────

export const GET_BRAND_COUPONS = gql`
  query GetBrandCoupons($input: BrandCouponsInquiry!) {
    getBrandCoupons(input: $input) {
      list {
        _id
        couponCode
        couponType
        brandId
        discountType
        discountValue
        couponMaxUsage
        couponUsageCount
        minOrderCount
        couponStartDate
        couponEndDate
        couponStatus
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

// ─── Brand Orders ─────────────────────────────────────────────────────────────

export const GET_BRAND_ORDERS = gql`
  query GetBrandOrders($input: BrandOrdersInquiry!) {
    getBrandOrders(input: $input) {
      orders {
        _id
        memberId
        brandId
        orderStatus
        orderTotalPrice
        orderTotalDiscountPrice
        orderFinalPrice
        orderPaymentMethod
        orderPaymentStatus
        orderDeliveryAddressId
        orderDeliveryStatus
        createdAt
        updatedAt
        member {
          _id
          memberNick
          memberImage
          memberEmail
          memberPhone
        }
        deliveryAddress {
          _id
          addressName
          addressPhone
          addressCountry
          addressCity
          addressZipCode
          addressLine1
          addressLine2
          isDefault
        }
        orderItems {
          _id
          orderId
          productId
          priceAtPurchase
          itemQuantity
          subtotal
          selectedSize
          selectedColor
          product {
            _id
            productTitle
            productImages
            productPrice
            productDiscountPrice
            productSize
            productColor
          }
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
