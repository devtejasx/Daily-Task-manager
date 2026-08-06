import { useCallback, useMemo, useState } from "react";
import { EMPTY_FILTERS, applyFilters, countActiveFilters, toggleValue } from "../utils/filters";

/**
 * Owns the mission-board filter state and derives the filtered list.
 *
 * @param {object[]} missions
 * @param {{dailySelected?: string[]}} [options]
 */
export function useMissionFilters(missions, options = {}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const { dailySelected } = options;

  const patch = useCallback((next) => setFilters((f) => ({ ...f, ...next })), []);

  const toggle = useCallback(
    (facet, value) => setFilters((f) => ({ ...f, [facet]: toggleValue(f[facet], value) })),
    []
  );

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const filtered = useMemo(
    () => applyFilters(missions, filters, { dailySelected }),
    [missions, filters, dailySelected]
  );

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  return { filters, filtered, activeCount, patch, toggle, reset, setFilters };
}
