import { useState, useMemo } from "react";

export function useSearch<T>(data: T[], searchFields: (item: T) => string[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data;

    return data.filter((item) =>
      searchFields(item).some((field) => field.toLowerCase().includes(query))
    );
  }, [data, searchQuery, searchFields]);

  return { searchQuery, setSearchQuery, filteredData };
}
