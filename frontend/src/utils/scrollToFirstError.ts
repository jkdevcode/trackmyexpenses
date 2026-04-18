/**
 * Scrolls to the first DOM element marked with [data-error-field].
 * Works for long item lists (50+ items) without needing individual refs.
 *
 * Usage: add data-error-field="items[N]" to any row/element with an error.
 */
export const scrollToFirstError = (containerEl?: HTMLElement | null): void => {
  const container: Element = containerEl ?? document.documentElement;
  const firstError = container.querySelector("[data-error-field]");

  if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = firstError.querySelector<HTMLElement>(
      "input, select, textarea",
    );

    if (input) {
      input.focus({ preventScroll: true });
    }
  }
};
