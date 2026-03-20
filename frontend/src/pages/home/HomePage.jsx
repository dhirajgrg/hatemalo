import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useListings, useCategories, useAuth } from "../../context";
import { statsService } from "../../services";
import {
  Button,
  Card,
  Badge,
  Spinner,
  OptimizedImage,
} from "../../components/ui";
import {
  HiOutlineSearch,
  HiOutlineFolder,
  HiOutlineCurrencyDollar,
  HiOutlineLocationMarker,
  HiOutlineChevronRight,
  HiOutlineArrowRight,
  HiOutlinePhotograph,
} from "react-icons/hi";
import LocationSearch from "../../components/map/LocationSearch";
import {
  HiOutlineHomeModern,
  HiOutlineTruck,
  HiOutlineBriefcase,
  HiOutlineDevicePhoneMobile,
  HiOutlineShoppingBag,
  HiOutlineComputerDesktop,
  HiOutlineTv,
  HiOutlineWrenchScrewdriver,
  HiOutlineTrophy,
  HiOutlineHeart,
} from "react-icons/hi2";

const CATEGORY_ICON_MAP = {
  "real-estate": HiOutlineHomeModern,
  "motors-vehicles": HiOutlineTruck,
  "motors/vehicles": HiOutlineTruck,
  jobs: HiOutlineBriefcase,
  "mobile-phones-and-communication": HiOutlineDevicePhoneMobile,
  "mobile-phones-communication": HiOutlineDevicePhoneMobile,
  "fashion-and-accessories": HiOutlineShoppingBag,
  "fashion-accessories": HiOutlineShoppingBag,
  "computers-and-gaming": HiOutlineComputerDesktop,
  "computers-gaming": HiOutlineComputerDesktop,
  "electronics-and-appliances": HiOutlineTv,
  "electronics-appliances": HiOutlineTv,
  "home-garden-and-pool": HiOutlineWrenchScrewdriver,
  "home-garden-pool": HiOutlineWrenchScrewdriver,
  "hobbies-sports-and-leisure": HiOutlineTrophy,
  "hobbies-sports-leisure": HiOutlineTrophy,
  "animals-and-pets": HiOutlineHeart,
  "animals-pets": HiOutlineHeart,
};

function getCategoryIcon(cat) {
  return CATEGORY_ICON_MAP[cat.slug] || HiOutlineFolder;
}

export default function HomePage() {
  const { listings, loading, fetchListings } = useListings();
  const { categories } = useCategories();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchListings({ limit: 8 });
  }, [fetchListings]);

  useEffect(() => {
    statsService
      .get()
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section - Bazaraki inspired */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Buy & Sell Everything
              <span className="block text-primary-300 mt-1">in Nepal</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Nepal&apos;s #1 marketplace. Find jobs, products, services &amp;
              more. Thousands of new listings every day.
            </p>

            {/* Search Bar - Prominent like Bazaraki */}
            <form
              onSubmit={handleSearch}
              className="mt-8 animate-fade-in-up animation-delay-100"
            >
              <div className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden p-1.5 gap-1.5 max-w-2xl mx-auto search-bar-glow">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-alt">
                  <HiOutlineSearch className="w-5 h-5 text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm md:text-base"
                  />
                </div>
                <LocationSearch
                  value={searchLocation}
                  onChange={setSearchLocation}
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <HiOutlineSearch className="w-5 h-5" />
                  Search
                </button>
              </div>
            </form>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 animate-fade-in-up animation-delay-200">
              <Link to="/listings">
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl transition-shadow duration-200 hover:-translate-y-0.5"
                >
                  <HiOutlineSearch className="w-5 h-5" /> Browse All Listings
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Admin Panel
                  </Button>
                </Link>
              )}
              {isAuthenticated && !isAdmin && (
                <Link to="/listings/new">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                  >
                    + Post a Listing
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Browse All Categories - Full Grid */}
      {categories.length > 0 && (
        <section className="bg-surface border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                  Browse Categories
                </h2>
                <p className="text-text-secondary mt-1">
                  Click any category to see listings instantly
                </p>
              </div>
              <Link to="/categories" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="group">
                  View All
                  <HiOutlineChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {categories.map((cat, idx) => {
                const Icon = getCategoryIcon(cat);
                return (
                  <div
                    key={cat._id}
                    className="category-card group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <Link
                      to={`/categories/${cat.slug}`}
                      className="block bg-surface rounded-xl border border-border p-5 hover:border-primary-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors duration-300">
                          <Icon className="w-6 h-6 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-text-primary text-sm group-hover:text-primary-600 transition-colors duration-200 truncate">
                            {cat.name}
                          </h3>
                          {cat.subcategories?.length > 0 && (
                            <p className="text-xs text-text-muted">
                              {cat.subcategories.length} subcategories
                            </p>
                          )}
                        </div>
                        <HiOutlineChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                      </div>

                      {/* Subcategories preview */}
                      {cat.subcategories?.length > 0 && (
                        <div className="space-y-1 border-t border-border pt-3">
                          {cat.subcategories.slice(0, 3).map((sub) => (
                            <span
                              key={sub._id}
                              className="block text-xs text-text-secondary hover:text-primary-600 transition-colors truncate"
                            >
                              {sub.name}
                            </span>
                          ))}
                          {cat.subcategories.length > 3 && (
                            <span className="text-xs text-primary-600 font-medium">
                              +{cat.subcategories.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            <div className="sm:hidden text-center mt-6">
              <Link to="/categories">
                <Button variant="outline" size="sm">
                  View All Categories
                  <HiOutlineChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recent Listings */}
      <section className="bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
                Latest Listings
              </h2>
              <p className="text-text-secondary mt-1">
                Fresh opportunities just posted
              </p>
            </div>
            <Link to="/listings">
              <Button variant="ghost" size="sm" className="group">
                View All
                <HiOutlineChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <Spinner className="py-12" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {listings.slice(0, 8).map((listing, idx) => (
                <Link
                  key={listing._id}
                  to={`/listings/${listing._id}`}
                  className="listing-card group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 overflow-hidden">
                    {/* Listing Image */}
                    {listing.images?.length > 0 ? (
                      <OptimizedImage
                        src={listing.images[0]}
                        alt={listing.title}
                        width={400}
                        height={300}
                        quality={75}
                        containerClassName="aspect-4/3 w-full bg-surface-alt"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="aspect-4/3 w-full bg-surface-alt flex items-center justify-center">
                        <HiOutlinePhotograph className="w-8 h-8 text-text-muted" />
                      </div>
                    )}
                    <Card.Body className="p-3 space-y-2">
                      <h3 className="font-semibold text-text-primary text-sm line-clamp-1 group-hover:text-primary-600 transition-colors duration-200">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {listing.condition && (
                          <Badge
                            variant={
                              listing.condition === "New"
                                ? "success"
                                : "default"
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
          )}
        </div>
      </section>

      {/* Stats / Trust Band */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                label: "Active Listings",
                value: stats ? stats.activeListings.toLocaleString() : "...",
              },
              {
                label: "Categories",
                value: stats ? String(stats.totalCategories) : "...",
              },
              {
                label: "Happy Users",
                value: stats ? stats.totalUsers.toLocaleString() : "...",
              },
              {
                label: "Cities Covered",
                value: stats ? String(stats.cities) : "...",
              },
            ].map((stat) => (
              <div key={stat.label} className="stat-item">
                <p className="text-2xl md:text-3xl font-extrabold text-primary-600">
                  {stat.value}
                </p>
                <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="cta-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Ready to start selling?
            </h2>
            <p className="mt-2 text-primary-100 max-w-lg mx-auto">
              Create your free account and post your first listing in minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                  Create Free Account
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/listings">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                >
                  Browse Listings
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
