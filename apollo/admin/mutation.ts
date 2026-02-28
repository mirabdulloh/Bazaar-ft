import { gql } from "@apollo/client";

// ─── Members ──────────────────────────────────────────────────────────────────

export const UPDATE_MEMBER_BY_ADMIN = gql`
  mutation UpdateMemberByAdmin($input: MemberUpdateByAdmin!) {
    updateMemberByAdmin(input: $input) {
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
  }
`;

// ─── Brands ───────────────────────────────────────────────────────────────────

export const UPDATE_BRAND_BY_ADMIN = gql`
  mutation UpdateBrandByAdmin($input: BrandUpdateByAdmin!) {
    updateBrandByAdmin(input: $input) {
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

// ─── Products ─────────────────────────────────────────────────────────────────

export const REMOVE_PRODUCT_BY_ADMIN = gql`
  mutation RemoveProductByAdmin($input: String!) {
    removeProductByAdmin(productId: $input) {
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
  }
`;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const UPDATE_ORDER_BY_ADMIN = gql`
  mutation UpdateOrderByAdmin($input: OrderUpdate!) {
    updateOrderByAdmin(input: $input) {
      _id
      memberId
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
      deliveryAddress {
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
        createdAt
        updatedAt
      }
      orderItems {
        _id
        orderId
        productId
        priceAtPurchase
        itemQuantity
        subtotal
        createdAt
        updatedAt
      }
    }
  }
`;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const UPDATE_REVIEW_BY_ADMIN = gql`
  mutation UpdateReviewByAdmin($input: ReviewUpdateByAdmin!) {
    updateReviewByAdmin(input: $input) {
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
      memberData {
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
      orderItemData {
        _id
        orderId
        productId
        priceAtPurchase
        itemQuantity
        subtotal
        createdAt
        updatedAt
      }
    }
  }
`;

export const REMOVE_REVIEW_BY_ADMIN = gql`
  mutation RemoveReviewByAdmin($input: String!) {
    removeReviewByAdmin(reviewId: $input) {
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
    }
  }
`;

// ─── Categories ───────────────────────────────────────────────────────────────

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      _id
      categoryName
      parentCategoryId
      categoryStatus
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: CategoryUpdate!) {
    updateCategory(input: $input) {
      _id
      categoryName
      parentCategoryId
      categoryStatus
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($input: String!) {
    deleteCategory(categoryId: $input) {
      _id
      categoryName
      parentCategoryId
      categoryStatus
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Addresses ───────────────────────────────────────────────────────────────

export const UPDATE_ADDRESS_BY_ADMIN = gql`
  mutation UpdateAddressByAdmin($input: AddressUpdateByAdmin!) {
    updateAddressByAdmin(input: $input) {
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
  }
`;

// ─── Article ───────────────────────────────────────────────────────────────
export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
  mutation UpdateBoardArticleByAdmin($input: ArticleUpdate!) {
    updateBoardArticleByAdmin(input: $input) {
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
  }
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
  mutation RemoveBoardArticleByAdmin($input: String!) {
    removeBoardArticleByAdmin(articleId: $input) {
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
  }
`;

// ─── Comment ───────────────────────────────────────────────────────────────
export const REMOVE_COMMENT_BY_ADMIN = gql`
  mutation RemoveCommentByAdmin($input: String!) {
    removeCommentByAdmin(commentId: $input) {
      _id
      commentStatus
      commentGroup
      commentRefId
      memberId
      commentReplyId
      commentContent
      commentLikes
      commentViews
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_COMMENT_BY_ADMIN = gql`
  mutation UpdateCommentByAdmin($input: CommentUpdateByAdmin!) {
    updateCommentByAdmin(input: $input) {
      _id
      commentStatus
      commentGroup
      commentRefId
      memberId
      commentReplyId
      commentContent
      commentLikes
      commentViews
      createdAt
      updatedAt
    }
  }
`;

// ─── CHAT ───────────────────────────────────────────────────────────────
export const UPDATE_CHAT_BY_ADMIN = gql`
  mutation UpdateChatByAdmin($input: ChatUpdate!) {
    updateChatByAdmin(input: $input) {
      _id
      memberId
      brandId
      chatStatus
      chatSubject
      createdAt
      updatedAt
      memberData {
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
        refreshToken
      }
      brandData {
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
  }
`;
// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CREATE_COUPON_BY_ADMIN = gql`
  mutation CreateCouponByAdmin($input: CouponInput!) {
    createCouponByAdmin(input: $input) {
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
  }
`;

export const UPDATE_COUPON_BY_ADMIN = gql`
  mutation UpdateCouponByAdmin($input: CouponUpdate!) {
    updateCouponByAdmin(input: $input) {
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
  }
`;

export const REMOVE_COUPON_BY_ADMIN = gql`
  mutation RemoveCouponByAdmin($input: String!) {
    removeCouponByAdmin(couponId: $input) {
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
  }
`;

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const CREATE_FAQ_BY_ADMIN = gql`
  mutation CreateFaqByAdmin($input: FaqInput!) {
    createFaqByAdmin(input: $input) {
      _id
      faqCategory
      faqStatus
      faqQuestion
      faqAnswer
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FAQ_BY_ADMIN = gql`
  mutation UpdateFaqByAdmin($input: FaqUpdate!) {
    updateFaqByAdmin(input: $input) {
      _id
      faqCategory
      faqStatus
      faqQuestion
      faqAnswer
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_FAQ_BY_ADMIN = gql`
  mutation RemoveFaqByAdmin($faqId: String!) {
    removeFaqByAdmin(faqId: $faqId) {
      _id
      faqCategory
      faqStatus
      faqQuestion
      faqAnswer
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Notices ──────────────────────────────────────────────────────────────────

export const CREATE_NOTICE_BY_ADMIN = gql`
  mutation CreateNoticeByAdmin($input: NoticeInput!) {
    createNoticeByAdmin(input: $input) {
      _id
      noticeCategory
      noticeStatus
      noticeTitle
      noticeContent
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
  mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
    updateNoticeByAdmin(input: $input) {
      _id
      noticeCategory
      noticeStatus
      noticeTitle
      noticeContent
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
  mutation RemoveNoticeByAdmin($noticeId: String!) {
    removeNoticeByAdmin(noticeId: $noticeId) {
      _id
      noticeCategory
      noticeStatus
      noticeTitle
      noticeContent
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Brand Coupons ────────────────────────────────────────────────────────────

// export const CREATE_BRAND_COUPON = gql`
//   mutation CreateBrandCoupon($input: BrandCouponInput!) {
//     createBrandCoupon(input: $input) {
//       _id
//       couponCode
//       discountType
//       discountValue
//       couponStartDate
//       couponEndDate
//       couponStatus
//     }
//   }
// `;

// export const UPDATE_BRAND_COUPON = gql`
//   mutation UpdateBrandCoupon($input: BrandCouponUpdate!) {
//     updateBrandCoupon(input: $input) {
//       _id
//       couponCode
//       discountType
//       discountValue
//       couponStatus
//       updatedAt
//     }
//   }
// `;

// ─── Messages (Chat) ────────────────────────────────────────────────────────────
export const REMOVE_MESSAGE_CHAT_BY_ADMIN = gql`
  mutation RemoveMessageChatByAdmin($messageId: String!) {
    removeMessageChatByAdmin(messageId: $messageId) {
      _id
      conversationId
      senderId
      message
      attachments
      replyToId
      readAt
      memberDeletedAt
      brandDeletedAt
      deletedAt
      createdAt
      updatedAt
    }
  }
`;

// ─── Notification ────────────────────────────────────────────────────────────
export const REMOVE_NOTIFICATION_BY_ADMIN = gql`
  mutation RemoveNotificationByAdmin($notificationId: String!) {
    removeNotificationByAdmin(notificationId: $notificationId) {
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
      authorData {
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
        refreshToken
      }
    }
  }
`;
