import { useState, useMemo } from "react";

import { useDebounce } from "@/hooks/useDebounce";

interface UseInvoiceFilterProps<T> {
  data: T[] | undefined | null;
  searchFn: (item: T, query: string) => boolean;
  debounceDelay?: number;
}

export function useInvoiceFilter<T>({
  data,
  searchFn,
  debounceDelay = 300,
}: UseInvoiceFilterProps<T>) {
  const [filterValue, setFilterValue] = useState("");
  const debouncedFilterValue = useDebounce(filterValue, debounceDelay);

  const filteredItems = useMemo(() => {
    const safeData = data ?? [];

    if (!debouncedFilterValue.trim()) {
      return safeData;
    }

    const query = debouncedFilterValue.toLowerCase().trim();

    return safeData.filter((item) => searchFn(item, query));
  }, [data, debouncedFilterValue, searchFn]);

  return {
    filterValue,
    setFilterValue,
    filteredItems,
  };
}
