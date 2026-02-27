import { gql } from "@apollo/client";

// ─── Member ───────────────────────────────────────────────────────────────────

export const GET_MEMBER = gql`
  query GetMember($input: String!) {
    getMember(memberId: $input) {
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
export const GET_MEMBERS = gql`
  query GetMembers($input: MembersInquiry!) {
    getMembers(input: $input) {
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
        refreshToken
      }
      metaData {
        total
        page
        limit
      }
    }
  }
`;

export const GET_BRANDS = gql`
  query GetBrands($input: BrandsInquiry!) {
    getBrands(input: $input) {
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
    }
  }
`;



// ─── Products ─────────────────────────────────────────────────────────────────

export const GET_PRODUCT = gql`
  query GetProduct($productId: String!) {
    getProduct(productId: $productId) {
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
      memberData {
        _id
        memberNick
        memberImage
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list {
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
        productRank
        productImages
        productRatingAverage
        productRatingCount
        productStockQuantity
        productSize
        productColor
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
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

export const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts($input: OrdinaryInquiry!) {
    getFavoriteProducts(input: $input) {
      list {
        _id
        productType
        productTitle
        productPrice
        productDiscountPrice
        productImages
        productRatingAverage
        productStockQuantity
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
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

export const GET_VISITED_PRODUCTS = gql`
  query GetVisitedProducts($input: OrdinaryInquiry!) {
    getVisitedProducts(input: $input) {
      list {
        _id
        productType
        productTitle
        productPrice
        productDiscountPrice
        productImages
        productRatingAverage
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

// ─── Brands ───────────────────────────────────────────────────────────────────

export const GET_BRAND = gql`
  query GetBrand($brandId: String!) {
    getBrand(brandId: $brandId) {
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
        memberImage
        memberFollowers
        memberProducts
      }
    }
  }
`;


// ─── Orders ───────────────────────────────────────────────────────────────────

export const GET_ORDER = gql`
  query GetOrder($orderId: String!) {
    getOrder(orderId: $orderId) {
      _id
      memberId
      orderStatus
      orderTotalPrice
      orderTotalDiscountPrice
      orderFinalPrice
      orderPaymentMethod
      orderPaymentStatus
      orderDeliveryStatus
      createdAt
      updatedAt
      deliveryAddress {
        _id
        addressName
        addressLine1
        addressLine2
        addressCity
        addressCountry
        addressZipCode
        addressPhone
      }
      orderItems {
        _id
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
      }
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: MyOrdersInquiry!) {
    getMyOrders(input: $input) {
      list {
        _id
        orderStatus
        orderTotalPrice
        orderFinalPrice
        orderPaymentMethod
        orderPaymentStatus
        orderDeliveryStatus
        createdAt
        orderItems {
          _id
          productId
          itemQuantity
          subtotal
          product {
            _id
            productTitle
            productImages
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

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const GET_REVIEWS = gql`
  query GetReviews($input: ReviewsInquiry!) {
    getReviews(input: $input) {
      list {
        _id
        productId
        memberId
        reviewRating
        reviewComment
        reviewImages
        reviewStatus
        reviewLikes
        createdAt
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

// ─── Addresses ────────────────────────────────────────────────────────────────

export const GET_ADDRESSES = gql`
  query GetAddresses {
    getAddresses {
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
      createdAt
      updatedAt
    }
  }
`;

// ─── Notifications ────────────────────────────────────────────────────────────

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($input: NotificationsInquiry!) {
    getMyNotifications(input: $input) {
      list {
        _id
        notificationType
        notificationStatus
        notificationGroup
        targetId
        notificationTitle
        notificationContent
        readAt
        createdAt
        authorData {
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

// ─── Follows ──────────────────────────────────────────────────────────────────

export const GET_MEMBER_FOLLOWINGS = gql`
  query GetMemberFollowings($input: FollowInquiry!) {
    getMemberFollowings(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        followingData {
          _id
          memberNick
          memberImage
          memberType
          memberFollowers
        }
        meFollowed {
          followerId
          followingId
          myFollowing
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

export const GET_MEMBER_FOLLOWERS = gql`
  query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
      list {
        _id
        followingId
        followerId
        createdAt
        followerData {
          _id
          memberNick
          memberImage
          memberType
        }
        meFollowed {
          followerId
          followingId
          myFollowing
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

// ─── Articles (Community) ─────────────────────────────────────────────────────

export const GET_BOARD_ARTICLE = gql`
  query GetBoardArticle($articleId: String!) {
    getBoardArticle(articleId: $articleId) {
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
      memberData {
        _id
        memberNick
        memberImage
      }
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
    }
  }
`;

export const GET_BOARD_ARTICLES = gql`
  query GetBoardArticles($input: ArticlesInquiry!) {
    getBoardArticles(input: $input) {
      list {
        _id
        memberId
        articleCategory
        articleStatus
        articleTitle
        articleImages
        articleViews
        articleLikes
        articleComments
        publishedAt
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

// ─── Comments ─────────────────────────────────────────────────────────────────

export const GET_COMMENTS = gql`
  query GetComments($input: CommentsInquiry!) {
    getComments(input: $input) {
      list {
        _id
        commentGroup
        commentRefId
        memberId
        commentReplyId
        commentContent
        commentLikes
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
        parentCommentData {
          _id
          commentContent
          memberId
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

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export const GET_FAQS = gql`
  query GetFaqs($input: FaqsInquiry!) {
    getFaqs(input: $input) {
      list {
        _id
        faqCategory
        faqQuestion
        faqAnswer
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

// ─── Notices ──────────────────────────────────────────────────────────────────

export const GET_NOTICES = gql`
  query GetNotices($input: NoticesInquiry!) {
    getNotices(input: $input) {
      list {
        _id
        noticeCategory
        noticeTitle
        noticeContent
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

// ─── Categories ───────────────────────────────────────────────────────────────

export const GET_CATEGORIES = gql`
  query GetCategories($input: CategoriesInquiry!) {
    getCategories(input: $input) {
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

export const CHECK_COUPON = gql`
  query CheckCoupon($couponCode: String!) {
    checkCoupon(couponCode: $couponCode) {
      _id
      couponCode
      couponType
      discountType
      discountValue
      couponEndDate
      couponStatus
    }
  }
`;

// ─── Chats ────────────────────────────────────────────────────────────────────

export const GET_MY_CHATS = gql`
  query GetMyChats($input: ChatsInquiry!) {
    getMyChats(input: $input) {
      list {
        _id
        memberId
        brandId
        chatStatus
        chatSubject
        createdAt
        brandData {
          _id
          brandName
          brandLogo
        }
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

// ─── Messages ─────────────────────────────────────────────────────────────────

export const GET_MESSAGES = gql`
  query GetMessages($input: MessagesInquiry!) {
    getMessages(input: $input) {
      list {
        _id
        conversationId
        senderId
        message
        attachments
        replyToId
        readAt
        createdAt
        updatedAt
        senderData {
          _id
          memberNick
          memberImage
        }
        parentMessageData {
          _id
          message
          senderId
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
