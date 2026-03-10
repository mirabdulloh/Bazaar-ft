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
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
      meFollowed {
        followerId
        followingId
        myFollowing
      }
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
        createdAt
        updatedAt
        memberData {
          _id
          memberNick
          memberImage
          memberRank
          memberLikes
          memberViews
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

// ─── Products ─────────────────────────────────────────────────────────────────
export const GET_PRODUCT = gql`
  query GetProduct($input: String!) {
    getProduct(productId: $input) {
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
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
        meFollowed {
          followerId
          followingId
          myFollowing
        }
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
          meLiked {
            memberId
            likeRefId
            myFavorite
          }
          meFollowed {
            followerId
            followingId
            myFollowing
          }
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

export const GET_FAVORITE_PRODUCTS = gql`
  query GetFavoriteProducts($input: OrdinaryInquiry!) {
    getFavoriteProducts(input: $input) {
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
  query GetOrder($input: String!) {
    getOrder(orderId: $input) {
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
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders($input: MyOrdersInquiry!) {
    getMyOrders(input: $input) {
      orders {
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
          createdAt
          updatedAt
          product {
            _id
            memberId
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
            productDesc
            productSize
            productColor
            productMaterials
            createdAt
            updatedAt
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
        orderItemId
        reviewRating
        reviewComment
        reviewImages
        reviewStatus
        reviewLikes
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
      metaCounter {
        total
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
          memberNick
          memberImage
        }
      }
      metaCounter {
        total
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
        updatedAt
        followingData {
          _id
          memberNick
          memberImage
          memberType
          memberFollowers
          memberFollowings
          memberLikes
          memberArticles
          memberProducts
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
      metaCounter {
        total
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
        updatedAt
        followerData {
          _id
          memberNick
          memberImage
          memberType
          memberFollowers
          memberFollowings
          memberLikes
          memberArticles
          memberProducts
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
      metaCounter {
        total
      }
    }
  }
`;

// ─── Articles (Community) ─────────────────────────────────────────────────────

export const GET_BOARD_ARTICLE = gql`
  query GetBoardArticle($input: String!) {
    getBoardArticle(articleId: $input) {
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
        articleContent
        articleImages
        articleViews
        articleLikes
        articleComments
        publishedAt
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
        memberData {
          _id
          memberNick
          memberImage
        }
      }
      metaCounter {
        total
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

export const GET_NOTICES = gql`
  query GetNotices($input: NoticesInquiry!) {
    getNotices(input: $input) {
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

// ─── Categories ───────────────────────────────────────────────────────────────

export const GET_CATEGORIES = gql`
  query GetCategories($input: CategoriesInquiry!) {
    getCategories(input: $input) {
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

// ─── Coupons ──────────────────────────────────────────────────────────────────

export const CHECK_COUPON = gql`
  query CheckCoupon($couponCode: String!) {
    checkCoupon(couponCode: $couponCode) {
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

