import { gql } from "@apollo/client";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
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
      memberBlocks
      memberProducts
      accessToken
      refreshToken
    }
  }
`;

export const SIGN_UP = gql`
  mutation Signup($input: MemberInput!) {
    signup(input: $input) {
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
      memberProducts
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($input: MemberUpdate!) {
    updateMember(input: $input) {
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
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: String!) {
    forgotPassword(email: $input)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
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

export const LIKE_TARGET_MEMBER = gql`
  mutation LikeTargetMember($input: String!) {
    likeTargetMember(memberId: $input) {
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

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

// ─── Products ─────────────────────────────────────────────────────────────────

export const LIKE_TARGET_PRODUCT = gql`
  mutation LikeTargetProduct($input: String!) {
    likeTargetProduct(productId: $input) {
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
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
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
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

// ─── Orders ───────────────────────────────────────────────────────────────────

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
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

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId) {
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
    }
  }
`;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
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

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($input: ReviewUpdate!) {
    updateReview(input: $input) {
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

export const LIKE_TARGET_REVIEW = gql`
  mutation LikeTargetReview($input: String!) {
    likeTargetReview(reviewId: $input) {
      _id
      reviewLikes
    }
  }
`;

// ─── Addresses ────────────────────────────────────────────────────────────────

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
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

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($input: AddressUpdate!) {
    updateAddress(input: $input) {
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
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($input: String!) {
    deleteAddress(addressId: $input) {
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

// ─── Notifications ────────────────────────────────────────────────────────────

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($input: NotificationUpdate!) {
    markNotificationAsRead(input: $input) {
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
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`;

export const REMOVE_ALL_MY_NOTIFICATIONS = gql`
  mutation RemoveAllMyNotifications {
    removeAllMyNotifications
  }
`;

// ─── Follows ──────────────────────────────────────────────────────────────────

export const SUBSCRIBE = gql`
  mutation Subscribe($input: String!) {
    subscribe(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
      followerData {
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
      meFollowed {
        followerId
        followingId
        myFollowing
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const UNSUBSCRIBE = gql`
  mutation Unsubscribe($input: String!) {
    unsubscribe(input: $input) {
      _id
      followingId
      followerId
      createdAt
      updatedAt
      followerData {
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
      meFollowed {
        followerId
        followingId
        myFollowing
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

// ─── Articles ─────────────────────────────────────────────────────────────────

export const CREATE_BOARD_ARTICLE = gql`
  mutation CreateBoardArticle($input: ArticleInput!) {
    createBoardArticle(input: $input) {
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

export const UPDATE_BOARD_ARTICLE = gql`
  mutation UpdateBoardArticle($input: ArticleUpdate!) {
    updateBoardArticle(input: $input) {
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

export const LIKE_TARGET_BOARD_ARTICLE = gql`
  mutation LikeTargetBoardArticle($input: String!) {
    likeTargetBoardArticle(articleId: $input) {
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

// ─── Comments ─────────────────────────────────────────────────────────────────

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
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

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: CommentUpdate!) {
    updateComment(input: $input) {
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

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      _id
      memberType
      memberStatus
      memberNick
      memberFullName
      memberEmail
      memberImage
      accessToken
      refreshToken
    }
  }
`;

export const CLAIM_COUPON = gql`
  mutation ClaimCoupon($couponCode: String!) {
    claimCoupon(couponCode: $couponCode) {
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
`;

