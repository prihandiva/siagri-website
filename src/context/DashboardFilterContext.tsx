"use client";

import React, { createContext, useContext, useState } from "react";

export type FilterType = "nasional" | "provinsi" | "kabupaten" | "kecamatan" | "desa";

export interface DashboardFilter {
  /** The selected territory ID (null = "all" / no filter at this level) */
  filterId: string | null;
  filterType: FilterType;
  filterLabel: string;
}

interface DashboardFilterContextValue {
  filter: DashboardFilter;
  setFilter: (f: DashboardFilter) => void;
}

const DashboardFilterContext = createContext<DashboardFilterContextValue | null>(null);

export function DashboardFilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<DashboardFilter>({
    filterId: null,
    filterType: "nasional",
    filterLabel: "Semua Wilayah",
  });

  return (
    <DashboardFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </DashboardFilterContext.Provider>
  );
}

export function useDashboardFilter() {
  const ctx = useContext(DashboardFilterContext);
  if (!ctx) throw new Error("useDashboardFilter must be used inside DashboardFilterProvider");
  return ctx;
}
