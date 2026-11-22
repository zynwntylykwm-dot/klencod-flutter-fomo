import { PAGE_SIZE } from "@/lib/constants";

export type VehicleFilters = {
  q: string;
  make: string;
  model: string;
  bodyType: string;
  fuelType: string;
  transmission: string;
  condition: string;
  damageType: string;
  locationCountry: string;
  locationCity: string;
  vin: string;
  lot: string;
  yearFrom: string;
  yearTo: string;
  priceFrom: string;
  priceTo: string;
  status: string;
  auctionId: string;
  sort: string;
  page: number;
};

export const EMPTY_FILTERS: VehicleFilters = {
  q: "",
  make: "",
  model: "",
  bodyType: "",
  fuelType: "",
  transmission: "",
  condition: "",
  damageType: "",
  locationCountry: "",
  locationCity: "",
  vin: "",
  lot: "",
  yearFrom: "",
  yearTo: "",
  priceFrom: "",
  priceTo: "",
  status: "",
  auctionId: "",
  sort: "ending",
  page: 1,
};

type SearchParamsInput = Record<string, string | string[] | undefined>;

function pick(params: SearchParamsInput, key: string): string {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim() : "";
}

export function parseFilters(params: SearchParamsInput): VehicleFilters {
  const page = Number.parseInt(pick(params, "page"), 10);
  const sort = pick(params, "sort");
  return {
    q: pick(params, "q").slice(0, 80),
    make: pick(params, "make"),
    model: pick(params, "model").slice(0, 60),
    bodyType: pick(params, "bodyType"),
    fuelType: pick(params, "fuelType"),
    transmission: pick(params, "transmission"),
    condition: pick(params, "condition"),
    damageType: pick(params, "damageType"),
    locationCountry: pick(params, "locationCountry"),
    locationCity: pick(params, "locationCity"),
    vin: pick(params, "vin").slice(0, 20).toUpperCase(),
    lot: pick(params, "lot").slice(0, 30),
    yearFrom: pick(params, "yearFrom"),
    yearTo: pick(params, "yearTo"),
    priceFrom: pick(params, "priceFrom"),
    priceTo: pick(params, "priceTo"),
    status: pick(params, "status"),
    auctionId: pick(params, "auctionId"),
    sort: sort || "ending",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function filtersToQueryString(filters: Partial<VehicleFilters>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "" || value === EMPTY_FILTERS.page) continue;
    if (typeof value === "number") {
      params.set(key, String(value));
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function activeFilterCount(filters: VehicleFilters): number {
  const skip = new Set(["sort", "page", "status", "auctionId"]);
  return Object.entries(filters).filter(
    ([key, value]) => !skip.has(key) && value !== "" && value !== undefined,
  ).length;
}

export function paginationRange(page: number, total: number): { from: number; to: number; pages: number } {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), pages);
  const from = (safePage - 1) * PAGE_SIZE;
  return { from, to: from + PAGE_SIZE, pages };
}
