import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useListings, useAuth } from "../../context";
import { userService } from "../../services";
import { Card, Badge, Button, Spinner, EmptyState } from "../../components/ui";
import NepalLocationInput from "../../components/ui/NepalLocationInput";
import { HiOutlinePlus, HiOutlineClipboardList } from "react-icons/hi";

export default function DashboardPage() {
  const { user, isAdmin, setUser } = useAuth();
  const navigate = useNavigate();
  const { myListings, loading, fetchMyListings, deleteListing } = useListings();

  const needsProfileCompletion = !user?.location || !user?.whatsapp;
  const [profileForm, setProfileForm] = useState({
    location: user?.location || "",
    whatsapp: (user?.whatsapp || "").replace(/^\+977/, ""),
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Redirect admin to admin panel
  useEffect(() => {
    if (isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchMyListings();
  }, [fetchMyListings]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await deleteListing(id);
  };

  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.location || !profileForm.whatsapp) {
      setProfileError("Both location and WhatsApp number are required");
      return;
    }
    if (!/^\d{10}$/.test(profileForm.whatsapp)) {
      setProfileError("Enter a valid 10-digit WhatsApp number");
      return;
    }
    setProfileLoading(true);
    setProfileError(null);
    try {
      const formData = new FormData();
      formData.append("location", profileForm.location);
      formData.append("whatsapp", `+977${profileForm.whatsapp}`);
      const { data: res } = await userService.updateProfile(formData);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const statusVariant = {
    pending: "warning",
    active: "success",
    suspended: "danger",
    sold: "default",
    closed: "danger",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome back, {user?.name}</p>
        </div>
        <Link to="/listings/new">
          <Button>
            <HiOutlinePlus className="w-4 h-4" /> New Listing
          </Button>
        </Link>
      </div>

      {/* Profile Completion Banner */}
      {needsProfileCompletion && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <Card.Body>
            <h3 className="text-lg font-semibold text-amber-800 mb-1">
              Complete Your Profile
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              Please add your location and WhatsApp number to verify your
              account and start posting listings.
            </p>
            {profileError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
                {profileError}
              </div>
            )}
            <form
              onSubmit={handleCompleteProfile}
              className="flex flex-col sm:flex-row gap-3 items-end"
            >
              {!user?.location && (
                <div className="flex-1 w-full">
                  <NepalLocationInput
                    label={null}
                    value={profileForm.location}
                    onChange={(val) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        location: val,
                      }))
                    }
                    placeholder="Search a location in Nepal..."
                    required
                  />
                </div>
              )}
              {!user?.whatsapp && (
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-amber-800 mb-1">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-amber-300 bg-amber-100 text-sm text-amber-800">
                      +977
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98XXXXXXXX"
                      value={profileForm.whatsapp}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        setProfileForm((prev) => ({
                          ...prev,
                          whatsapp: val,
                        }));
                      }}
                      className="flex-1 rounded-r-lg border border-amber-300 px-3 py-2 text-sm bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}
              <Button type="submit" loading={profileLoading} size="sm">
                Save &amp; Verify
              </Button>
            </form>
          </Card.Body>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Listings" value={myListings.length} />
        <StatCard
          label="Pending"
          value={myListings.filter((l) => l.status === "pending").length}
        />
        <StatCard
          label="Active"
          value={myListings.filter((l) => l.status === "active").length}
        />
        <StatCard
          label="Sold / Closed"
          value={
            myListings.filter(
              (l) => l.status === "sold" || l.status === "closed",
            ).length
          }
        />
      </div>

      {/* Listings Table */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold text-text-primary">
            My Listings
          </h2>
        </Card.Header>
        {loading ? (
          <Spinner className="py-12" />
        ) : myListings.length === 0 ? (
          <EmptyState
            icon={<HiOutlineClipboardList className="w-12 h-12" />}
            title="No listings yet"
            description="Create your first listing to get started."
            action={
              <Link to="/listings/new">
                <Button size="sm">Create Listing</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Price
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 font-medium text-text-secondary">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 font-medium text-text-secondary">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((listing) => (
                  <tr
                    key={listing._id}
                    className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/listings/${listing._id}`}
                        className="font-medium text-text-primary hover:text-primary-600"
                      >
                        {listing.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {listing.category?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-text-primary font-medium">
                      {listing.price
                        ? `Rs. ${listing.price.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[listing.status]}>
                        {listing.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-text-muted">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/listings/${listing._id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(listing._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <Card.Body>
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
      </Card.Body>
    </Card>
  );
}
