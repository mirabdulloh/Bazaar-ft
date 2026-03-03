import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import debounce from "lodash/debounce";

export default function useProductFilterCard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [collapsed, setCollapsed] = useState(true);
  const [prices, setPrices] = useState<number[]>(
    JSON.parse(searchParams.get("prices") || "[0, 300]")
  );

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

  const discount = useMemo<number>(
    () => Number(searchParams.get("discount") || "0"),
    [searchParams]
  );

  const handleChangeSearchParams = useCallback(
    (key: string, value: string) => {
      if (!key || !value) return;
      const params = new URLSearchParams(searchParams);
      params.set(key, value);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const debouncedChangePrice = debounce((values: number[]) => {
    handleChangeSearchParams("prices", JSON.stringify(values));
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
    handleChangeSearchParams("colors", JSON.stringify(values));
  }, [colors, handleChangeSearchParams]);

  const handleChangeBrand = useCallback((value: string) => {
    const values = brands.includes(value)
      ? brands.filter((item) => item !== value)
      : [...brands, value];
    handleChangeSearchParams("brands", JSON.stringify(values));
  }, [brands, handleChangeSearchParams]);

  const handleChangeSales = useCallback((value: string) => {
    const values = sales.includes(value)
      ? sales.filter((item) => item !== value)
      : [...sales, value];
    handleChangeSearchParams("sales", JSON.stringify(values));
  }, [sales, handleChangeSearchParams]);

  const handleChangeSize = useCallback((value: string) => {
    const values = sizes.includes(value)
      ? sizes.filter((item) => item !== value)
      : [...sizes, value];
    handleChangeSearchParams("sizes", JSON.stringify(values));
  }, [sizes, handleChangeSearchParams]);

  const handleChangeMaterial = useCallback((value: string) => {
    const values = materials.includes(value)
      ? materials.filter((item) => item !== value)
      : [...materials, value];
    handleChangeSearchParams("materials", JSON.stringify(values));
  }, [materials, handleChangeSearchParams]);

  const handleChangeDiscount = useCallback((value: number) => {
    const next = discount === value ? 0 : value;
    handleChangeSearchParams("discount", next.toString());
  }, [discount, handleChangeSearchParams]);

  return {
    sales,
    brands,
    rating,
    colors,
    prices,
    sizes,
    materials,
    discount,
    collapsed,
    setCollapsed,
    handleChangePrice,
    handleChangeColor,
    handleChangeBrand,
    handleChangeSales,
    handleChangeSize,
    handleChangeMaterial,
    handleChangeDiscount,
    handleChangeSearchParams,
  };
}
