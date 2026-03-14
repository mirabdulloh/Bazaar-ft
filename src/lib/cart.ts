import type { CartItem } from "contexts/CartContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type CouponLike = {
  couponType?: string | null;
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

export function calculateEstimatedCouponDiscount(coupon: CouponLike | null, subtotal: number) {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.couponType === "BRAND") return 0;

  if (coupon.discountType === "PERCENTAGE") {
    return Math.min(subtotal, (subtotal * Number(coupon.discountValue ?? 0)) / 100);
  }

  return Math.min(subtotal, Number(coupon.discountValue ?? 0));
}

export function getCartBrandsNote(cart: CartItem[], coupon: CouponLike | null) {
  if (!coupon) return "";
  if (coupon.couponType !== "BRAND") return "";
  if (cart.length <= 1) {
    return "Brand coupon will be applied during order placement if this product belongs to the coupon brand.";
  }

  return "Brand coupon will be validated against eligible brand items during order placement.";
}
