import { gql } from "@apollo/client";

// ─── Members ──────────────────────────────────────────────────────────────────

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
  query GetAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
      members {
        _id
        memberType
        memberStatus
        memberAuthType
        memberPhone
        memberNick
        memberFullName
        memberEmail
        memberImage
        memberAddress
        memberDesc
        memberArticles
        memberFollowers
        memberFollowings
        memberPoints
        memberLikes
        memberViews
        memberComments
        memberRank
        memberWarnings
        memberProducts
        memberBlocks
        memberCouponId
        memberCouponStatus
        memberCouponUsedAt
        memberCouponAssignedAt
        lastLoginAt
        lastActiveAt
        deletedAt
        createdAt
        updatedAt
        accessToken
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;

// ─── Brands ───────────────────────────────────────────────────────────────────

export const GET_ALL_BRANDS_BY_ADMIN = gql`
  query GetAllBrandsByAdmin($input: AllBrandsInquiry!) {
    getAllBrandsByAdmin(input: $input) {
      list {
        _id
        brandName
        brandLogo
        brandDesc
        brandStatus
        brandRating
        brandFollowersCount
        brandReviewsCount
        createdAt
        memberData {
          _id
          memberNick
          memberPhone
          memberEmail
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

// ─── Products ─────────────────────────────────────────────────────────────────

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
  query GetAllProductsByAdmin($input: AllProductsInquiry!) {
    getAllProductsByAdmin(input: $input) {
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

// ─── Orders ───────────────────────────────────────────────────────────────────

export const GET_ALL_ORDERS_BY_ADMIN = gql`
  query GetAllOrdersByAdmin($input: AllOrdersInquiry!) {
    getAllOrdersByAdmin(input: $input) {
      list {
        _id
        memberId
        orderStatus
        orderTotalPrice
        orderFinalPrice
        orderPaymentMethod
        orderPaymentStatus
        orderDeliveryStatus
        createdAt
        member {
          _id
          memberNick
          memberPhone
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

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const GET_ALL_REVIEWS_BY_ADMIN = gql`
  query GetAllReviewsByAdmin($input: AllReviewsInquiry!) {
    getAllReviewsByAdmin(input: $input) {
      list {
        _id
        productId
        memberId
        reviewRating
        reviewComment
        reviewStatus
        reviewLikes
        createdAt
        memberData {
          _id
          memberNick
        }
        productData {
          _id
          productTitle
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

// ─── Categories ───────────────────────────────────────────────────────────────

export const GET_ALL_CATEGORIES_BY_ADMIN = gql`
  query GetAllCategoriesByAdmin($input: AllCategoriesInquiry!) {
    getAllCategoriesByAdmin(input: $input) {
      list {
        _id
        categoryName
        parentCategoryId
        categoryStatus
        createdAt
        subCategories {
          _id
          categoryName
          categoryStatus
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

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const GET_ALL_COUPONS_BY_ADMIN = gql`
  query GetAllCouponsByAdmin($input: CouponsInquiry!) {
    getAllCouponsByAdmin(input: $input) {
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
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const GET_ALL_FAQS_BY_ADMIN = gql`
  query GetAllFaqsByAdmin($input: FaqsInquiryByAdmin!) {
    getAllFaqsByAdmin(input: $input) {
      list {
        _id
        faqCategory
        faqStatus
        faqQuestion
        faqAnswer
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

// ─── Notices ──────────────────────────────────────────────────────────────────

export const GET_ALL_NOTICES_BY_ADMIN = gql`
  query GetAllNoticesByAdmin($input: NoticesInquiry!) {
    getAllNoticesByAdmin(input: $input) {
      list {
        _id
        noticeCategory
        noticeStatus
        noticeTitle
        noticeContent
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

// ─── Board Articles ───────────────────────────────────────────────────────────

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
  query GetAllBoardArticlesByAdmin($input: AllArticlesInquiry!) {
    getAllBoardArticlesByAdmin(input: $input) {
      list {
        _id
        memberId
        articleCategory
        articleStatus
        articleTitle
        articleViews
        articleLikes
        articleComments
        createdAt
        memberData {
          _id
          memberNick
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

// ─── Notifications ────────────────────────────────────────────────────────────

export const GET_ALL_NOTIFICATIONS_BY_ADMIN = gql`
  query GetAllNotificationsByAdmin($input: NotificationsInquiry!) {
    getAllNotificationsByAdmin(input: $input) {
      list {
        _id
        memberId
        notificationType
        notificationStatus
        notificationTitle
        notificationContent
        createdAt
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;
