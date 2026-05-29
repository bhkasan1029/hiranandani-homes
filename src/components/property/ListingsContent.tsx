"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { MapPin, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import PropertyCard from "@/components/property/PropertyCard";
import MobileFilterToggle from "@/components/search/MobileFilterToggle";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-50 rounded-xl border text-sm text-gray-400 gap-2">
      <MapPin className="h-4 w-4 animate-pulse" />
      Loading map…
    </div>
  ),
});

const PAGE_SIZE = 6;

interface PropertyCardData {
  id: string;
  title: string;
  type: string;
  listingType: string;
  locality: string;
  building: string;
  bedrooms: number | null;
  areaSqft: number;
  furnished: string;
  price: number;
  deposit: number | null;
  latitude: number | null;
  longitude: number | null;
  images: { id: string; url: string; isPrimary: boolean }[];
}

function SkeletonGrid({ isGrid }: { isGrid: boolean }) {
  return (
    <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" : "flex flex-col gap-3 sm:gap-4"}>
      {Array.from({ length: PAGE_SIZE }).map((_, i) =>
        isGrid ? (
          <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
            <div className="h-48 sm:h-56 bg-zinc-100" />
            <div className="p-4 sm:p-5 space-y-3">
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-50 rounded w-1/2" />
              <div className="h-5 bg-zinc-100 rounded w-1/3 mt-4" />
            </div>
          </div>
        ) : (
          <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse flex flex-col sm:flex-row">
            <div className="w-full sm:w-[220px] md:w-[260px] h-44 sm:h-auto bg-zinc-100 flex-shrink-0" />
            <div className="flex-1 p-4 sm:p-5 space-y-3">
              <div className="h-4 bg-zinc-100 rounded w-3/4" />
              <div className="h-3 bg-zinc-50 rounded w-1/2" />
              <div className="flex gap-3 mt-2">
                <div className="h-3 bg-zinc-100 rounded w-16" />
                <div className="h-3 bg-zinc-100 rounded w-16" />
                <div className="h-3 bg-zinc-100 rounded w-20" />
              </div>
              <div className="h-5 bg-zinc-100 rounded w-1/3 mt-4" />
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default function ListingsContent() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const view = searchParams.get("view") ?? "grid";
  const locality = searchParams.get("locality") ?? "All Localities";
  const listingType = searchParams.get("listingType");
  const listingTypeLabel = listingType === "RENT" ? "available for rent" : "available for sale";
  const listingWord = total === 1 ? "property" : "properties";
  const isGrid = view !== "list";
  const paramsKey = searchParams.toString();

  useEffect(() => {
    setLoading(true);
    setProperties([]);

    const params = new URLSearchParams();
    for (const [key, val] of searchParams.entries()) {
      if (key !== "view") params.set(key, val);
    }
    params.set("take", view === "map" ? "50" : String(PAGE_SIZE));
    params.set("skip", "0");

    fetch(`/api/properties?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProperties(data.properties ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || properties.length >= total) return;
    setLoadingMore(true);

    const params = new URLSearchParams();
    for (const [key, val] of searchParams.entries()) {
      if (key !== "view") params.set(key, val);
    }
    params.set("skip", String(properties.length));
    params.set("take", String(PAGE_SIZE));

    try {
      const res = await fetch(`/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties((prev) => [...prev, ...data.properties]);
    } finally {
      setLoadingMore(false);
    }
  }, [properties.length, total, loadingMore, searchParams]);

  function viewLink(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", key);
    return `/listings?${params.toString()}`;
  }

  const hasMore = properties.length < total;

  return (
    <>
      {/* Header */}
      <div className="flex items-start sm:items-end justify-between mb-6 sm:mb-12 flex-wrap gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-zinc-900">
            Properties in {locality}
          </h1>
          <p className="text-zinc-500 mt-1 sm:mt-2 text-xs sm:text-sm">
            {loading
              ? "Loading properties…"
              : total > 0
              ? `${total} ${listingWord} ${listingTypeLabel}`
              : "No properties match your filters"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <MobileFilterToggle />
          {(["grid", "list"] as const).map((key) => (
            <Link key={key} href={viewLink(key)}>
              <button
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                  view === key
                    ? "bg-zinc-900 text-white shadow-lg"
                    : "bg-white text-zinc-500 border border-[#e4e9ea] hover:bg-[#f2f4f4]"
                }`}
              >
                {key === "grid" ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid isGrid={isGrid} />
      ) : properties.length === 0 ? (
        <div className="text-center py-16 sm:py-20 text-zinc-400">
          <SlidersHorizontal className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-4 opacity-40" />
          <p className="font-medium text-zinc-900 text-sm sm:text-base">
            No properties match your filters.
          </p>
          <Link
            href="/listings"
            className="text-zinc-500 hover:text-zinc-900 text-xs sm:text-sm mt-2 inline-block underline underline-offset-2"
          >
            Clear all filters
          </Link>
        </div>
      ) : view === "map" ? (
        <MapView properties={properties} />
      ) : (
        <>
          <div className={isGrid ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-stretch" : "flex flex-col gap-3 sm:gap-4"}>
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} variant={isGrid ? "grid" : "list"} />
            ))}
            {loadingMore &&
              Array.from({ length: PAGE_SIZE }).map((_, i) =>
                isGrid ? (
                  <div key={`sk-${i}`} className="bg-white rounded-xl overflow-hidden animate-pulse">
                    <div className="h-48 sm:h-56 bg-zinc-100" />
                    <div className="p-4 sm:p-5 space-y-3">
                      <div className="h-4 bg-zinc-100 rounded w-3/4" />
                      <div className="h-3 bg-zinc-50 rounded w-1/2" />
                      <div className="h-5 bg-zinc-100 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                ) : (
                  <div key={`sk-${i}`} className="bg-white rounded-xl overflow-hidden animate-pulse flex flex-col sm:flex-row">
                    <div className="w-full sm:w-[220px] md:w-[260px] h-44 sm:h-auto bg-zinc-100 flex-shrink-0" />
                    <div className="flex-1 p-4 sm:p-5 space-y-3">
                      <div className="h-4 bg-zinc-100 rounded w-3/4" />
                      <div className="h-3 bg-zinc-50 rounded w-1/2" />
                      <div className="h-5 bg-zinc-100 rounded w-1/3 mt-4" />
                    </div>
                  </div>
                )
              )}
          </div>

          <div className="mt-10 sm:mt-16 flex justify-center">
            {hasMore && !loadingMore && (
              <button
                onClick={loadMore}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white border border-[#e4e9ea] rounded-xl text-zinc-900 font-bold text-sm sm:text-base hover:bg-[#f2f4f4] transition-all active:scale-95"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Load More Properties
              </button>
            )}
            {!hasMore && total > PAGE_SIZE && (
              <p className="text-xs sm:text-sm text-zinc-400">
                All {total} properties shown
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
