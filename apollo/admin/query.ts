import { gql } from "@apollo/client";

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    getAdminDashboardStats {
      totalBrands
      pendingBrands
      activeBrands
      inactiveBrands
      suspendedBrands
      totalMembers
      userMembers
      brandMembers
      adminMembers
      blockedMembers
      deletedMembers
      openOrders
      activePlatformCoupons
      totalArticles
      inactiveArticles
      totalReviews
      inactiveReviews
      pendingBrandQueue {
        _id
        brandName
        brandLogo
        memberImage
        brandStatus
        createdAt
      }
      latestOrders {
        _id
        customerName
        brandName
        orderStatus
        orderPaymentStatus
        orderDeliveryStatus
        orderFinalPrice
        createdAt
      }
    }
  }
`;

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
      brands {
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
        memberData {
          _id
          memberNick
          memberImage
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
        brand {
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
        orderItemId
        reviewRating
        reviewComment
        reviewImages
        reviewStatus
        reviewLikes
        createdAt
        updatedAt
        productData {
          _id
          memberId
          productTitle
          productImages
          productStatus
        }
        memberData {
          _id
          memberNick
          memberFullName
          memberEmail
          memberImage
          memberType
          memberStatus
        }
      }
      metaCounter {
        total
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
        deletedAt
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

// ─── Addresses ───────────────────────────────────────────────────────────────
export const GET_ALL_ADDRESSES_BY_ADMIN = gql`
  query GetAllAddressesByAdmin($input: AddressesInquiry!) {
    getAllAddressesByAdmin(input: $input) {
      list {
        _id
        memberId
        addressName
        addressPhone
        addressCountry
        addressCity
        addressZipCode
        addressLine1
        addressLine2
        isDefault
        addressStatus
        deletedAt
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

// ─── CHat ───────────────────────────────────────────────────────────────
export const GET_ALL_CHATS_BY_ADMIN = gql`
  query GetAllChatsByAdmin($input: ChatsInquiryByAdmin!) {
    getAllChatsByAdmin(input: $input) {
      list {
        _id
        memberId
        brandId
        chatStatus
        chatSubject
        createdAt
        updatedAt
      }
      metaCounter {
        total
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
        updatedAt
      }
      metaCounter {
        total
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
        deletedAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
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
        deletedAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
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
        articleContent
        articleImages
        articleViews
        articleLikes
        articleComments
        publishedAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
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
        authorId
        receiverId
        notificationType
        notificationStatus
        notificationGroup
        targetId
        notificationTitle
        notificationContent
        deletedAt
        readAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;

// ─── Messages (Chat) ────────────────────────────────────────────────────────────
export const GET_ALL_MESSAGES_BY_ADMIN = gql`
  query GetAllMessagesByAdmin($input: MessagesInquiry!) {
    getAllMessagesByAdmin(input: $input) {
      list {
        _id
        conversationId
        senderId
        message
        attachments
        replyToId
        readAt
        deletedAt
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;
