import type { ReactNode } from "react";

import { useState, useEffect } from "react";
import { Pagination } from "@heroui/pagination";

import { useColorTheme } from "@/hooks/use-color-theme";

export interface PaginatedItemsProps<T> {
  /** The full array of items to paginate */
  items: T[];
  /** Number of items to show per page (default: 10) */
  itemsPerPage?: number;
  /** Render function for an individual item */
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * Optional wrapper function. If provided, it's called with the rendered items
   * and the pagination component, allowing complete control over their placement.
   */
  renderList?: (
    itemsContent: ReactNode,
    paginationContent: ReactNode | null,
  ) => ReactNode;
  /** Standard CSS class for the container if renderList is not provided */
  className?: string;
  /**
   * Optional dependency to reset pagination safely (e.g., when a search filter changes).
   * Changing this value will reset the page to 1.
   */
  resetKey?: unknown;
}

export function PaginatedItems<T>({
  items,
  itemsPerPage = 10,
  renderItem,
  renderList,
  className = "",
  resetKey,
}: PaginatedItemsProps<T>) {
  const { appColor } = useColorTheme();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // If items length decreases to the point where the current page is out of bounds,
  // we safely pull it back to the last valid page.
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // If a resetKey is provided (like a filter string), reset to page 1 on change
  useEffect(() => {
    if (resetKey !== undefined) {
      setCurrentPage(1);
    }
  }, [resetKey]);

  const showPagination = totalPages > 1;

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedItems = items.slice(start, end);

  const itemsContent = paginatedItems.map((item, index) =>
    renderItem(item, index),
  );

  const paginationContent = showPagination ? (
    <div className="flex w-full justify-center">
      <Pagination
        isCompact
        showControls
        showShadow
        size="sm"
        color={appColor}
        page={currentPage}
        total={totalPages}
        onChange={setCurrentPage}
      />
    </div>
  ) : null;

  if (renderList) {
    return <>{renderList(itemsContent, paginationContent)}</>;
  }

  return (
    <div className={className}>
      {itemsContent}
      {showPagination && <div className="mt-4">{paginationContent}</div>}
    </div>
  );
}
