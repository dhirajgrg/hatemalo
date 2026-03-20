import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useListings, useAuth } from "../../context";
import { Card, Badge, Button, Spinner } from "../../components/ui";
import { configService } from "../../services";
import LocationMap from "../../components/map/LocationMap";
import { optimizeImage } from "../../utils/imagekit";
import {
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineUser,
  HiOutlineCalendar,
  HiChevronLeft,
  HiChevronRight,
  HiOutlinePhone,
} from "react-icons/hi";

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentListing: listing,
    loading,
    fetchListing,
    deleteListing,
  } = useListings();
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);
  const [categoryConfig, setCategoryConfig] = useState(null);
  const [showVerifyMsg, setShowVerifyMsg] = useState(false);

  const isViewerVerified = user?.isVerified && user?.location && user?.whatsapp;

  useEffect(() => {
    fetchListing(id);
  }, [id, fetchListing]);

  // Fetch category config to label attributes
  const fetchConfig = useCallback(async (categoryId) => {
    if (!categoryId) return;
    try {
      const { data } = await configService.getByCategory(categoryId);
      setCategoryConfig(data.data.config);
    } catch {
      setCategoryConfig(null);
    }
  }, []);

  useEffect(() => {
    if (listing) {
      const catId = listing.category?._id || listing.category;
      if (catId) fetchConfig(catId);
    }
  }, [listing, fetchConfig]);

  useEffect(() => {
    setCurrentImage(0);
  }, [listing]);

  const isOwner = user && listing?.createdBy?._id === user._id;
  const isAdmin = user?.role === "admin";

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    await deleteListing(id);
    navigate("/listings");
  };

  if (loading) return <Spinner className="py-20" />;
  if (!listing) return null;

  const images = listing.images || [];
  const statusVariant = {
    pending: "warning",
    active: "success",
    suspended: "danger",
    sold: "default",
    closed: "danger",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/listings"
        className="text-sm text-primary-600 hover:text-primary-700 font-medium mb-6 inline-block"
      >
        &larr; Back to Listings
      </Link>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mb-6 rounded-xl overflow-hidden bg-surface-alt">
          <div className="relative aspect-video">
            <img
              src={optimizeImage(images[currentImage], {
                width: 1200,
                quality: 85,
              })}
              alt={listing.title}
              className="w-full h-full object-contain bg-black/5"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === 0 ? images.length - 1 : prev - 1,
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                >
                  <HiChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) =>
                      prev === images.length - 1 ? 0 : prev + 1,
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                >
                  <HiChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentImage
                          ? "bg-primary-600"
                          : "bg-white/60 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                    i === currentImage
                      ? "border-primary-600"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={optimizeImage(url, {
                      width: 120,
                      height: 120,
                      quality: 70,
                    })}
                    alt={`Thumbnail ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {listing.status === "pending" && (isOwner || isAdmin) && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm mb-4">
          This listing is pending admin approval and is not yet visible to the
          public.
        </div>
      )}
      {listing.status === "suspended" && (isOwner || isAdmin) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          This listing has been suspended by an admin.
        </div>
      )}

      <Card>
        <Card.Body className="space-y-6">
          {/* Title & Status */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {listing.title}
              </h1>
              {listing.category && (
                <Badge variant="primary" className="mt-2">
                  {listing.category.name}
                </Badge>
              )}
            </div>
            <Badge
              variant={statusVariant[listing.status] || "default"}
              className="text-sm"
            >
              {listing.status}
            </Badge>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border">
            <MetaItem
              icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
              label="Price"
              value={
                listing.price ? `Rs. ${listing.price.toLocaleString()}` : "N/A"
              }
            />
            {listing.salary && (
              <MetaItem
                icon={<HiOutlineCurrencyDollar className="w-5 h-5" />}
                label="Salary"
                value={`Rs. ${listing.salary.toLocaleString()}`}
              />
            )}
            {listing.location && (
              <MetaItem
                icon={<HiOutlineLocationMarker className="w-5 h-5" />}
                label="Location"
                value={listing.location}
              />
            )}
            <MetaItem
              icon={<HiOutlineUser className="w-5 h-5" />}
              label="Posted by"
              value={listing.createdBy?.name || "Unknown"}
            />
            <MetaItem
              icon={<HiOutlineCalendar className="w-5 h-5" />}
              label="Posted"
              value={new Date(listing.createdAt).toLocaleDateString()}
            />
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Description
            </h2>
            <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Contact via WhatsApp */}
          {listing.createdBy?.whatsapp && (
            <div>
              {showVerifyMsg && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-2">
                  Please verify your account first (email verification,
                  location, and WhatsApp number) to view seller contact details.
                  {user ? (
                    <Link to="/profile" className="font-medium underline ml-1">
                      Complete your profile
                    </Link>
                  ) : (
                    <Link to="/login" className="font-medium underline ml-1">
                      Log in
                    </Link>
                  )}
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <HiOutlinePhone className="w-5 h-5 text-green-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Contact Seller via WhatsApp
                  </p>
                  <p className="text-xs text-green-600">
                    {isViewerVerified
                      ? listing.createdBy.whatsapp
                      : "+977xxxxxxxxxx"}
                  </p>
                </div>
                {isViewerVerified ? (
                  <a
                    href={`https://wa.me/${listing.createdBy.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in your listing "${listing.title}" on Hatemalo.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowVerifyMsg(true)}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Location Map */}
          {listing.coordinates?.lat && (
            <LocationMap
              coordinates={listing.coordinates}
              location={listing.location}
            />
          )}

          {/* Dynamic Attributes */}
          {listing.attributes && Object.keys(listing.attributes).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-text-primary mb-3">
                Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(listing.attributes).map(([key, value]) => {
                  if (
                    value === null ||
                    value === undefined ||
                    value === "" ||
                    (Array.isArray(value) && value.length === 0)
                  )
                    return null;
                  // Use config to get label, fallback to key
                  const fieldConfig = categoryConfig?.fields?.find(
                    (f) => f.name === key,
                  );
                  const label = fieldConfig?.label || key;
                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : String(value);
                  const unit = fieldConfig?.unit ? ` ${fieldConfig.unit}` : "";

                  return (
                    <div
                      key={key}
                      className="bg-surface-alt rounded-lg px-3 py-2"
                    >
                      <p className="text-xs text-text-muted">{label}</p>
                      <p className="text-sm font-medium text-text-primary">
                        {displayValue}
                        {unit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Owner/Admin Actions */}
          {(isOwner || isAdmin) && (
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => navigate(`/listings/${id}/edit`)}
              >
                Edit Listing
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-text-muted mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text-primary">{value}</p>
      </div>
    </div>
  );
}
