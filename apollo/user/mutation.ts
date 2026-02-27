import { gql } from "@apollo/client";

// ─── Auth ─────────────────────────────────────────────────────────────────────

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
  mutation LikeTargetProduct($productId: String!) {
    likeTargetProduct(productId: $productId) {
      _id
      productLikes
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

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const CREATE_REVIEW = gql`
  mutation CreateReview($input: ReviewInput!) {
    createReview(input: $input) {
      _id
      reviewRating
      reviewComment
      reviewImages
      createdAt
    }
  }
`;

export const UPDATE_REVIEW = gql`
  mutation UpdateReview($input: ReviewUpdate!) {
    updateReview(input: $input) {
      _id
      reviewRating
      reviewComment
      reviewImages
      updatedAt
    }
  }
`;

// ─── Addresses ────────────────────────────────────────────────────────────────

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: AddressInput!) {
    createAddress(input: $input) {
      _id
      addressName
      addressPhone
      addressCountry
      addressCity
      addressZipCode
      addressLine1
      addressLine2
      isDefault
      addressStatus
      createdAt
    }
  }
`;

export const UPDATE_ADDRESS = gql`
  mutation UpdateAddress($input: AddressUpdate!) {
    updateAddress(input: $input) {
      _id
      addressName
      addressPhone
      addressCountry
      addressCity
      addressZipCode
      addressLine1
      addressLine2
      isDefault
      addressStatus
      updatedAt
    }
  }
`;

export const DELETE_ADDRESS = gql`
  mutation DeleteAddress($addressId: String!) {
    deleteAddress(addressId: $addressId) {
      _id
      addressStatus
    }
  }
`;

// ─── Notifications ────────────────────────────────────────────────────────────

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($input: NotificationUpdate!) {
    markNotificationAsRead(input: $input) {
      _id
      notificationStatus
      readAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
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
    }
  }
`;

export const UNSUBSCRIBE = gql`
  mutation Unsubscribe($input: String!) {
    unsubscribe(input: $input) {
      _id
      followingId
      followerId
    }
  }
`;

// ─── Articles ─────────────────────────────────────────────────────────────────

export const CREATE_BOARD_ARTICLE = gql`
  mutation CreateBoardArticle($input: ArticleInput!) {
    createBoardArticle(input: $input) {
      _id
      articleCategory
      articleTitle
      articleContent
      articleImages
      createdAt
    }
  }
`;

export const UPDATE_BOARD_ARTICLE = gql`
  mutation UpdateBoardArticle($input: ArticleUpdate!) {
    updateBoardArticle(input: $input) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImages
      updatedAt
    }
  }
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
  mutation LikeTargetBoardArticle($articleId: String!) {
    likeTargetBoardArticle(articleId: $articleId) {
      _id
      articleLikes
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

// ─── Comments ─────────────────────────────────────────────────────────────────

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      _id
      commentGroup
      commentRefId
      commentContent
      createdAt
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: CommentUpdate!) {
    updateComment(input: $input) {
      _id
      commentContent
      updatedAt
    }
  }
`;

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CLAIM_COUPON = gql`
  mutation ClaimCoupon($couponCode: String!) {
    claimCoupon(couponCode: $couponCode) {
      _id
      memberCouponId
      memberCouponStatus
      memberCouponAssignedAt
    }
  }
`;

// ─── Chats ────────────────────────────────────────────────────────────────────

export const OPEN_OR_GET_CHAT = gql`
  mutation OpenOrGetChat($input: OpenChatInput!) {
    openOrGetChat(input: $input) {
      _id
      memberId
      brandId
      chatStatus
      chatSubject
      createdAt
    }
  }
`;

export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: String!) {
    deleteChat(chatId: $chatId) {
      _id
      chatStatus
    }
  }
`;

// ─── Messages ─────────────────────────────────────────────────────────────────

export const SEND_MESSAGE = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      _id
      conversationId
      senderId
      message
      attachments
      replyToId
      createdAt
    }
  }
`;

export const UPDATE_MESSAGE_CHAT = gql`
  mutation UpdateMessageChat($input: MessageChatUpdate!) {
    updateMessageChat(input: $input) {
      _id
      message
      updatedAt
    }
  }
`;

export const REMOVE_MESSAGE_CHAT = gql`
  mutation RemoveMessageChat($input: RemoveMessageInput!) {
    removeMessageChat(input: $input) {
      _id
      deletedAt
    }
  }
`;
