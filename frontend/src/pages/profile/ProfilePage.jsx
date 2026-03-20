import { useState } from "react";
import { useAuth } from "../../context";
import { userService } from "../../services";
import { Card, Button, Input } from "../../components/ui";
import NepalLocationInput from "../../components/ui/NepalLocationInput";
import { HiOutlineCamera } from "react-icons/hi";
import { optimizeImage } from "../../utils/imagekit";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [form, setForm] = useState({
    name: user?.name || "",
    location: user?.location || "",
    whatsapp: (user?.whatsapp || "").replace(/^\+977/, ""),
    password: "",
  });

  const canChangeName = () => {
    if (!user?.nameLastUpdatedAt) return true;
    const daysSince =
      (Date.now() - new Date(user.nameLastUpdatedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return daysSince >= 30;
  };

  const daysUntilNameChange = () => {
    if (!user?.nameLastUpdatedAt) return 0;
    const daysSince =
      (Date.now() - new Date(user.nameLastUpdatedAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - daysSince));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (form.name !== user?.name) formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("whatsapp", form.whatsapp ? `+977${form.whatsapp}` : "");
    if (form.password) formData.append("password", form.password);
    if (profilePicFile) formData.append("profilePic", profilePicFile);

    try {
      const { data: res } = await userService.updateProfile(formData);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Profile updated successfully");
      setEditing(false);
      setForm((prev) => ({ ...prev, password: "" }));
      setProfilePicFile(null);
      setProfilePicPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const avatarSrc =
    profilePicPreview ||
    (user?.profilePic
      ? optimizeImage(user.profilePic, { width: 200, height: 200, quality: 85 })
      : null);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Profile</h1>

      <Card>
        <Card.Body className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-surface-dark rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-text-inverse">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {editing && (
                <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <HiOutlineCamera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {user?.name}
              </h2>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <p className="text-xs text-text-muted capitalize">{user?.role}</p>
            </div>
          </div>

          {editing ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 pt-4 border-t border-border"
            >
              <div>
                <Input
                  label="Name"
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={!canChangeName()}
                />
                {!canChangeName() && (
                  <p className="mt-1 text-xs text-amber-600">
                    You can change your name in {daysUntilNameChange()} day(s)
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email
                </label>
                <p className="text-sm text-text-primary bg-surface-alt px-3 py-2 rounded-lg border border-border">
                  {user?.email}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  Email cannot be changed
                </p>
              </div>
              <NepalLocationInput
                label="Location"
                value={form.location}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, location: val }))
                }
              />
              <div>
                <label
                  htmlFor="whatsapp"
                  className="block text-sm font-medium text-text-secondary mb-1"
                >
                  WhatsApp Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-surface-alt text-sm text-text-secondary">
                    +977
                  </span>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={form.whatsapp}
                    onChange={(e) => {
                      const val = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setForm((prev) => ({ ...prev, whatsapp: val }));
                    }}
                    className="flex-1 rounded-r-lg border border-border px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <Input
                label="New Password (leave blank to keep current)"
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <div className="flex gap-3">
                <Button type="submit" loading={loading}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setProfilePicFile(null);
                    setProfilePicPreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 pt-4 border-t border-border">
              <InfoRow label="Name" value={user?.name} />
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Location" value={user?.location || "Not set"} />
              <InfoRow
                label="WhatsApp"
                value={user?.whatsapp ? user.whatsapp : "Not set"}
              />
              <InfoRow
                label="Joined"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—"
                }
              />
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}
