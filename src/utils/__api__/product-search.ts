import { cache } from "react";
import productDatabase from "data/product-database";

// FILTER OPTIONS
const CATEGORIES = [
  { title: "Bath Preparations", children: ["Bubble Bath", "Bath Capsules", "Others"] },
  { title: "Eye Makeup Preparations" },
  { title: "Fragrance" },
  { title: "Hair Preparations" }
];

const BRANDS = [
  { label: "Mac", value: "mac" },
  { label: "Karts", value: "karts" },
  { label: "Baals", value: "baals" },
  { label: "Bukks", value: "bukks" },
  { label: "Luasis", value: "luasis" }
];

const OTHERS = [
  { label: "On Sale", value: "sale" },
  { label: "In Stock", value: "stock" },
  { label: "Featured", value: "featured" }
];

const COLORS = ["#1C1C1C", "#FF7A7A", "#FFC672", "#84FFB5", "#70F6FF", "#6B7AFF"];

export const getFilters = cache(async () => {
  return {
    brands: BRANDS,
    others: OTHERS,
    colors: COLORS,
    categories: CATEGORIES
  };
});

interface Params {
  q: string;
  page: string;
  sale: string;
  sort: string;
  prices: string;
  colors: string;
  brands: string;
  rating: string;
  category: string;
}

export const getProducts = cache(
  async ({ q, page, sort, sale, prices, colors, brands, rating, category }: Params) => {
    let products = productDatabase.slice(95, 104);

    if (sale) {
      products = productDatabase.slice(0, 10);
    }

    if (prices) {
      products = productDatabase.slice(10, 20);
    }

    if (colors) {
      products = productDatabase.slice(20, 30);
    }

    if (brands) {
      products = productDatabase.slice(30, 40);
    }

    if (rating) {
      products = productDatabase.slice(40, 50);
    }

    if (q) {
      products = productDatabase.slice(50, 60);
    }

    if (category) {
      products = productDatabase.slice(60, 70);
    }

    if (sort) {
      products = productDatabase.slice(70, 80);
    }

    return {
      products,
      pageCount: 1,
      totalProducts: products.length,
      firstIndex: 0,
      lastIndex: 9
    };
  }
);
