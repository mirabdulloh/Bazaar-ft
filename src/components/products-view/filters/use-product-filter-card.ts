import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";

export default function useProductFilterCard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(true);
  const safeParsePrices = (raw: string | null): number[] => {
    try {
      const parsed = JSON.parse(raw || "[0, 300]");
      const min = Number(Array.isArray(parsed) ? parsed[0] : 0);
      const max = Number(Array.isArray(parsed) ? parsed[1] : 300);
      return [
        Number.isFinite(min) ? min : 0,
        Number.isFinite(max) ? max : 300,
      ];
    } catch {
      return [0, 300];
    }
  };

  const [prices, setPrices] = useState<number[]>(safeParsePrices(searchParams.get("prices")));

  const rating = useMemo<number>(
    () => JSON.parse(searchParams.get("rating") || "0"),
    [searchParams]
  );

  const colors = useMemo<string[]>(
    () => JSON.parse(searchParams.get("colors") || "[]"),
    [searchParams]
  );

  const sales = useMemo<string[]>(
    () => JSON.parse(searchParams.get("sales") || "[]"),
    [searchParams]
  );

  const brands = useMemo<string[]>(
    () => JSON.parse(searchParams.get("brands") || "[]"),
    [searchParams]
  );

  const sizes = useMemo<string[]>(
    () => JSON.parse(searchParams.get("sizes") || "[]"),
    [searchParams]
  );

  const materials = useMemo<string[]>(
    () => JSON.parse(searchParams.get("materials") || "[]"),
    [searchParams]
  );

  const categoryId = useMemo<string>(
    () => searchParams.get("categoryId") || "",
    [searchParams]
  );

  const discount = useMemo<number>(
    () => Number(searchParams.get("discount") || "0"),
    [searchParams]
  );

  const setSearchParam = useCallback(
    (key: string, value?: string) => {
      if (!key) return;
      const params = new URLSearchParams(searchParams);
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const debouncedChangePrice = debounce((values: number[]) => {
    setSearchParam("prices", JSON.stringify(values));
  }, 500);

  const handleChangePrice = useCallback(
    (values: number[]) => {
      setPrices(values);
      debouncedChangePrice(values);
    },
    [debouncedChangePrice]
  );

  const handleChangeColor = useCallback((value: string) => {
    const values = colors.includes(value)
      ? colors.filter((item) => item !== value)
      : [...colors, value];
    setSearchParam("colors", JSON.stringify(values));
  }, [colors, setSearchParam]);

  const handleChangeBrand = useCallback((value: string) => {
    const values = brands.includes(value)
      ? brands.filter((item) => item !== value)
      : [...brands, value];
    setSearchParam("brands", JSON.stringify(values));
  }, [brands, setSearchParam]);

  const handleChangeSales = useCallback((value: string) => {
    const values = sales.includes(value)
      ? sales.filter((item) => item !== value)
      : [...sales, value];
    setSearchParam("sales", JSON.stringify(values));
  }, [sales, setSearchParam]);

  const handleChangeSize = useCallback((value: string) => {
    const values = sizes.includes(value)
      ? sizes.filter((item) => item !== value)
      : [...sizes, value];
    setSearchParam("sizes", JSON.stringify(values));
  }, [sizes, setSearchParam]);

  const handleChangeMaterial = useCallback((value: string) => {
    const values = materials.includes(value)
      ? materials.filter((item) => item !== value)
      : [...materials, value];
    setSearchParam("materials", JSON.stringify(values));
  }, [materials, setSearchParam]);

  const handleChangeCategory = useCallback((value: string) => {
    const next = categoryId === value ? "" : value;
    setSearchParam("categoryId", next);
  }, [categoryId, setSearchParam]);

  const handleChangeDiscount = useCallback((value: number) => {
    const next = discount === value ? 0 : value;
    setSearchParam("discount", next.toString());
  }, [discount, setSearchParam]);

  return {
    sales,
    brands,
    rating,
    colors,
    prices,
    sizes,
    materials,
    categoryId,
    discount,
    collapsed,
    setCollapsed,
    handleChangePrice,
    handleChangeColor,
    handleChangeBrand,
    handleChangeSales,
    handleChangeSize,
    handleChangeMaterial,
    handleChangeCategory,
    handleChangeDiscount,
    handleChangeSearchParams: setSearchParam,
  };
}
