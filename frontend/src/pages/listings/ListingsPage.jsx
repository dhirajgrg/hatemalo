import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useListings, useCategories } from "../../context";
import {
  Card,
  Badge,
  Spinner,
  EmptyState,
  Select,
  Input,
  Button,
  OptimizedImage,
} from "../../components/ui";
import { DynamicFiltersPanel } from "../../components/dynamic";
import { configService } from "../../services";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlinePhotograph,
} from "react-icons/hi";
import LocationSearch from "../../components/map/LocationSearch";

export default function ListingsPage() {
  const { listings, pagination, loading, fetchListings } = useListings();
  const { flatCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    status: searchParams.get("status") || "",
  });

  const [attrFilters, setAttrFilters] = useState({});
  const [categoryConfig, setCategoryConfig] = useState(null);

  // Fetch config when category filter changes
  const fetchConfig = useCallback(async (categoryId) => {
    if (!categoryId) {
      setCategoryConfig(null);
      setAttrFilters({});
      return;
    }
    try {
      const { data } = await configService.getByCategory(categoryId);
      setCategoryConfig(data.data.config);
    } catch {
      setCategoryConfig(null);
    }
  }, []);

  // Sync filters when URL search params change
  useEffect(() => {
    const newFilters = {
      category: searchParams.get("category") || "",
      location: searchParams.get("location") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      status: searchParams.get("status") || "",
    };
    setFilters(newFilters);

    // Restore attr filters from URL
    const restored = {};
    for (const [key, val] of searchParams.entries()) {
      if (key.startsWith("attr_")) {
        const rest = key.slice(5);
        if (rest.endsWith("_min")) {
          const name = rest.slice(0, -4);
          restored[name] = { ...(restored[name] || {}), min: val };
        } else if (rest.endsWith("_max")) {
          const name = rest.slice(0, -4);
          restored[name] = { ...(restored[name] || {}), max: val };
        } else {
          restored[rest] = val;
        }
      }
    }
    setAttrFilters(restored);
  }, [searchParams]);

  useEffect(() => {
    fetchConfig(filters.category);
  }, [filters.category, fetchConfig]);

  useEffect(() => {
    const params = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params[key] = val;
    });
    // Add attr filters
    for (const [key, val] of searchParams.entries()) {
      if (key.startsWith("attr_")) {
        params[key] = val;
      }
    }
    params.page = searchParams.get("page") || 1;
    fetchListings(params);
  }, [searchParams, fetchListings]);

  const handleAttrFilterChange = (name, value) => {
    setAttrFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    // Serialize attr filters
    Object.entries(attrFilters).forEach(([name, value]) => {
      if (value && typeof value === "object" && (value.min || value.max)) {
        if (value.min) params.set(`attr_${name}_min`, value.min);
        if (value.max) params.set(`attr_${name}_max`, value.max);
      } else if (Array.isArray(value) && value.length > 0) {
        params.set(`attr_${name}`, value.join(","));
      } else if (value) {
        params.set(`attr_${name}`, value);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Browse Listings
        </h1>
        <p className="text-text-secondary mt-1">
          Find what you&apos;re looking for
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <Card.Body>
          <form onSubmit={handleFilter} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                id="filter-category"
                placeholder="All Categories"
                value={filters.category}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, category: e.target.value }))
                }
                options={flatCategories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
              />
              <LocationSearch
                value={filters.location}
                onChange={(val) => setFilters((p) => ({ ...p, location: val }))}
                variant="filter"
              />
              <Input
                id="filter-min"
                placeholder="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, minPrice: e.target.value }))
                }
              />
              <Input
                id="filter-max"
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, maxPrice: e.target.value }))
                }
              />
              <Button type="submit" className="w-full">
                <HiOutlineSearch className="w-4 h-4" /> Search
              </Button>
            </div>

            {/* Dynamic Attribute Filters */}
            {categoryConfig?.filters?.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Category Filters
                </p>
                <DynamicFiltersPanel
                  config={categoryConfig}
                  values={attrFilters}
                  onChange={handleAttrFilterChange}
                />
              </div>
            )}
          </form>
        </Card.Body>
      </Card>

      {/* Results */}
      {loading ? (
        <Spinner className="py-20" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<HiOutlineSearch className="w-12 h-12" />}
          title="No listings found"
          description="Try adjusting your filters or check back later."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link key={listing._id} to={`/listings/${listing._id}`}>
                <Card className="hover:shadow-md transition-shadow h-full overflow-hidden">
                  {listing.images?.length > 0 ? (
                    <OptimizedImage
                      src={listing.images[0]}
                      alt={listing.title}
                      width={400}
                      height={300}
                      quality={75}
                      containerClassName="aspect-4/3 w-full bg-surface-alt"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="aspect-4/3 w-full bg-surface-alt flex items-center justify-center">
                      <HiOutlinePhotograph className="w-8 h-8 text-text-muted" />
                    </div>
                  )}
                  <Card.Body className="p-3 space-y-2">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-1">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {listing.condition && (
                        <Badge
                          variant={
                            listing.condition === "New" ? "success" : "default"
                          }
                        >
                          {listing.condition}
                        </Badge>
                      )}
                      {listing.listingType &&
                        listing.listingType !== "For Sale" && (
                          <Badge
                            variant={
                              listing.listingType === "For Rent"
                                ? "warning"
                                : listing.listingType === "Wanted" ||
                                    listing.listingType === "Hiring"
                                  ? "danger"
                                  : "primary"
                            }
                          >
                            {listing.listingType}
                          </Badge>
                        )}
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-border">
                      <div className="flex items-center gap-1">
                        <HiOutlineCurrencyDollar className="w-3.5 h-3.5 text-primary-600" />
                        <span className="font-bold text-text-primary text-sm">
                          {listing.price
                            ? `Rs. ${listing.price.toLocaleString()}`
                            : "N/A"}
                        </span>
                      </div>
                      {listing.location && (
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <HiOutlineLocationMarker className="w-3 h-3" />
                          <span className="truncate max-w-20">
                            {listing.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
