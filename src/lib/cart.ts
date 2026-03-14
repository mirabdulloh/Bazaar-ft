import type { CartItem } from "contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type CouponLike = {
  couponType?: string | null;
  brandId?: string | null;
  discountType?: string | null;
  discountValue?: number | null;
};

export function resolveCartImage(image?: string | null): string {
  if (!image) return "/assets/images/products/product-1.png";

  const value = image.trim().replace(/^['"]+|['"]+$/g, "");
  if (!value || value === "null" || value === "undefined") {
    return "/assets/images/products/product-1.png";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const normalized = value.startsWith("/") ? value : `/${value}`;
  const isFrontendAsset =
    normalized.startsWith("/assets/") || normalized.startsWith("/img/") || normalized.startsWith("/placeholder/");

  if (isFrontendAsset) return normalized;
  return API_URL ? `${API_URL}${normalized}` : normalized;
}

export function calculateEstimatedCouponDiscount(coupon: CouponLike | null, cart: CartItem[]) {
  if (!coupon || !cart.length) return 0;

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  if (subtotal <= 0) return 0;

  const eligibleSubtotal =
    coupon.couponType === "BRAND" && coupon.brandId
      ? cart
          .filter((item) => item.brandId && String(item.brandId) === String(coupon.brandId))
          .reduce((acc, item) => acc + item.price * item.qty, 0)
      : subtotal;

  if (eligibleSubtotal <= 0) return 0;

  if (coupon.discountType === "PERCENTAGE") {
    return Math.min(eligibleSubtotal, (eligibleSubtotal * Number(coupon.discountValue ?? 0)) / 100);
  }

  return Math.min(eligibleSubtotal, Number(coupon.discountValue ?? 0));
}

export function getCartBrandsNote(cart: CartItem[], coupon: CouponLike | null) {
  if (!coupon) return "";
  if (coupon.couponType !== "BRAND") return "";

  const hasMatchingBrandItems = !!coupon.brandId && cart.some((item) => String(item.brandId ?? "") === String(coupon.brandId));
  if (!hasMatchingBrandItems) {
    return "This brand coupon does not match any products currently in your cart.";
  }

  return "This brand coupon is applied only to matching products from that brand in your cart.";
}
