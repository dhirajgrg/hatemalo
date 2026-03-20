import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCategories, useListings } from "../../context";
import {
  Card,
  Badge,
  Spinner,
  EmptyState,
  Button,
  OptimizedImage,
} from "../../components/ui";
import {
  HiOutlineSearch,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlinePhotograph,
  HiOutlineChevronRight,
  HiOutlineFolder,
} from "react-icons/hi";

export default function CategoryListingsPage() {
  const { slug } = useParams();
  const { categories } = useCategories();
  const { listings, pagination, loading, fetchListings } = useListings();
  const [selectedSub, setSelectedSub] = useState(null);

  // Find the parent category by slug
  const parentCategory = categories.find((c) => c.slug === slug);
  const subcategories = parentCategory?.subcategories || [];

  // Reset selected sub when parent changes
  useEffect(() => {
    setSelectedSub(null);
  }, [slug]);

  // Fetch listings when category/sub changes
  useEffect(() => {
    if (!parentCategory) return;
    const params = { limit: 20 };
    if (selectedSub) {
      params.category = selectedSub;
    } else {
      params.category = parentCategory._id;
    }
    fetchListings(params);
  }, [parentCategory, selectedSub, fetchListings]);

  if (!parentCategory && categories.length > 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={<HiOutlineFolder className="w-12 h-12" />}
          title="Category not found"
          description="The category you're looking for doesn't exist."
          action={
            <Link to="/categories">
              <Button>View All Categories</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link to="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <HiOutlineChevronRight className="w-3 h-3" />
        <Link
          to="/categories"
          className="hover:text-primary-600 transition-colors"
        >
          Categories
        </Link>
        <HiOutlineChevronRight className="w-3 h-3" />
        <span className="text-text-primary font-medium">
          {parentCategory?.name || "Loading..."}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          {parentCategory?.name}
        </h1>
        <p className="text-text-secondary mt-1">
          Browse {parentCategory?.name} listings
          {subcategories.length > 0 &&
            ` across ${subcategories.length} subcategories`}
        </p>
      </div>

      {/* Subcategory Pills */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedSub(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              !selectedSub
                ? "bg-primary-600 text-white shadow-md"
                : "bg-surface border border-border text-text-secondary hover:border-primary-400 hover:text-primary-600"
            }`}
          >
            All {parentCategory?.name}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub._id}
              onClick={() => setSelectedSub(sub._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSub === sub._id
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-surface border border-border text-text-secondary hover:border-primary-400 hover:text-primary-600"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Spinner className="py-20" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={<HiOutlineSearch className="w-12 h-12" />}
          title="No listings found"
          description={
            selectedSub
              ? "No listings in this subcategory yet. Try another one."
              : "No listings in this category yet."
          }
        />
      ) : (
        <>
          <p className="text-sm text-text-muted mb-4">
            {pagination.total || listings.length} listing
            {(pagination.total || listings.length) !== 1 ? "s" : ""} found
          </p>

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
        </>
      )}
    </div>
  );
}
