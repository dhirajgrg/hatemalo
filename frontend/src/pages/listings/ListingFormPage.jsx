import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useListings, useCategories, useAuth } from "../../context";
import { Card, Button, Input, Select } from "../../components/ui";
import { DynamicFormRenderer } from "../../components/dynamic";
import LocationPicker from "../../components/map/LocationPicker";
import { configService } from "../../services";
import { HiOutlinePhotograph, HiX } from "react-icons/hi";

export default function ListingFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { createListing, updateListing, fetchListing, loading, error } =
    useListings();
  const { flatCategories, categories } = useCategories();
  const { user, isAdmin } = useAuth();
  const isProfileComplete = user?.location && user?.whatsapp;

  // Admin cannot post listings (only edit existing)
  useEffect(() => {
    if (isAdmin && !isEdit) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, isEdit, navigate]);

  // Determine if selected category belongs to a "Jobs"-type parent
  const getParentSlug = (categoryId) => {
    if (!categoryId) return null;
    const flat = flatCategories.find((c) => c._id === categoryId);
    if (!flat) return null;
    if (flat.parentId) {
      const parent = categories.find((c) => c._id === flat.parentId);
      return parent?.slug || null;
    }
    return flat.slug;
  };

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    condition: "",
    listingType: "For Sale",
    status: "active",
  });

  const parentSlug = getParentSlug(form.category);
  const isJobsCategory = parentSlug === "jobs";
  const [attributes, setAttributes] = useState({});
  const [categoryConfig, setCategoryConfig] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Fetch config when category changes
  const fetchConfig = useCallback(async (categoryId) => {
    if (!categoryId) {
      setCategoryConfig(null);
      return;
    }
    try {
      const { data } = await configService.getByCategory(categoryId);
      setCategoryConfig(data.data.config);
    } catch {
      setCategoryConfig(null);
    }
  }, []);

  useEffect(() => {
    fetchConfig(form.category);
  }, [form.category, fetchConfig]);

  // Reset listingType/condition when switching to/from jobs category
  useEffect(() => {
    if (!form.category || isEdit) return;
    if (isJobsCategory) {
      setForm((prev) => ({ ...prev, listingType: "Hiring", condition: "" }));
    } else {
      setForm((prev) => {
        if (prev.listingType === "Hiring") {
          return { ...prev, listingType: "For Sale" };
        }
        return prev;
      });
    }
  }, [isJobsCategory, form.category, isEdit]);

  useEffect(() => {
    if (isEdit) {
      fetchListing(id).then((listing) => {
        if (listing) {
          setForm({
            title: listing.title || "",
            description: listing.description || "",
            price: listing.price || "",
            category: listing.category?._id || listing.category || "",
            location: listing.location || "",
            condition: listing.condition || "",
            listingType: listing.listingType || "For Sale",
            status: listing.status || "active",
          });
          setExistingImages(listing.images || []);
          setAttributes(listing.attributes || {});
          if (listing.coordinates?.lat) {
            setCoordinates(listing.coordinates);
          }
        }
      });
    }
  }, [id, isEdit, fetchListing]);

  // Reset dependent fields when parent field changes
  const handleAttributeChange = useCallback(
    (name, value) => {
      setAttributes((prev) => {
        const next = { ...prev, [name]: value };
        // Reset fields that depend on the changed field
        if (categoryConfig?.fields) {
          categoryConfig.fields.forEach((f) => {
            if (f.dependsOn?.field === name) {
              next[f.name] = "";
            }
          });
        }
        return next;
      });
    },
    [categoryConfig],
  );

  const validate = () => {
    const errors = {};
    if (!form.title) errors.title = "Title is required";
    if (!form.description) errors.description = "Description is required";
    if (!form.price) errors.price = "Price is required";
    if (!form.category) errors.category = "Category is required";
    if (!form.location) errors.location = "Location is required";
    if (!isEdit && images.length === 0)
      errors.images = "At least 1 image is required";
    if (images.length + existingImages.length > 5)
      errors.images = "Maximum 5 images allowed";

    // Validate required dynamic fields
    if (categoryConfig?.fields) {
      categoryConfig.fields.forEach((field) => {
        if (field.required) {
          const val = attributes[field.name];
          if (val === undefined || val === null || val === "") {
            errors[field.name] = `${field.label} is required`;
          }
        }
      });
    }

    return errors;
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + existingImages.length + files.length;
    if (totalImages > 5) {
      setFormErrors((prev) => ({
        ...prev,
        images: "Maximum 5 images allowed",
      }));
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setFormErrors((prev) => ({ ...prev, images: undefined }));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", Number(form.price));
    formData.append("category", form.category);
    formData.append("location", form.location);
    if (coordinates.lat) {
      formData.append("coordinates", JSON.stringify(coordinates));
    }
    if (form.condition) formData.append("condition", form.condition);
    formData.append("listingType", form.listingType);
    if (isEdit) formData.append("status", form.status);
    formData.append("attributes", JSON.stringify(attributes));
    existingImages.forEach((url) => formData.append("existingImages", url));
    images.forEach((file) => formData.append("images", file));

    try {
      if (isEdit) {
        await updateListing(id, formData);
        navigate(`/listings/${id}`);
      } else {
        const listing = await createListing(formData);
        navigate(`/listings/${listing._id}`);
      }
    } catch {
      // error is set in context
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        {isEdit ? "Edit Listing" : "Create New Listing"}
      </h1>

      {!isProfileComplete && !isEdit && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm mb-6">
          You need to add your <strong>location</strong> and{" "}
          <strong>WhatsApp number</strong> before posting a listing.{" "}
          <Link to="/profile" className="font-medium underline">
            Complete your profile
          </Link>
        </div>
      )}

      <Card>
        <Card.Body>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Images ({images.length + existingImages.length}/5)
              </label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, i) => (
                  <div
                    key={`existing-${i}`}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group"
                  >
                    <img
                      src={url}
                      alt={`Existing ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.map((file, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length + existingImages.length < 5 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <HiOutlinePhotograph className="w-6 h-6 text-text-muted" />
                    <span className="text-xs text-text-muted mt-1">Add</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {formErrors.images && (
                <p className="mt-1 text-xs text-red-500">{formErrors.images}</p>
              )}
            </div>

            <Input
              label="Title"
              id="title"
              name="title"
              placeholder="e.g. iPhone 15 Pro Max"
              value={form.title}
              onChange={handleChange}
              error={formErrors.title}
            />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Describe your listing in detail..."
                value={form.description}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm bg-surface text-text-primary
                  placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500
                  ${formErrors.description ? "border-red-500" : "border-border"}`}
              />
              {formErrors.description && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.description}
                </p>
              )}
            </div>

            <Input
              label="Price (Rs.)"
              id="price"
              name="price"
              type="number"
              placeholder="0"
              value={form.price}
              onChange={handleChange}
              error={formErrors.price}
            />

            <Select
              label="Category"
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={flatCategories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              error={formErrors.category}
            />

            <LocationPicker
              location={form.location}
              coordinates={coordinates}
              onLocationChange={(val) =>
                setForm((prev) => ({ ...prev, location: val }))
              }
              onCoordinatesChange={setCoordinates}
              error={formErrors.location}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isJobsCategory &&
                !categoryConfig?.fields?.some(
                  (f) => f.name === "condition",
                ) && (
                  <Select
                    label="Condition"
                    id="condition"
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    placeholder="Select condition..."
                    options={[
                      { value: "New", label: "New" },
                      { value: "Like New", label: "Like New" },
                      { value: "Used", label: "Used" },
                      { value: "Refurbished", label: "Refurbished" },
                    ]}
                  />
                )}
              <Select
                label="Listing Type"
                id="listingType"
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
                options={
                  isJobsCategory
                    ? [
                        { value: "Hiring", label: "Hiring" },
                        { value: "Wanted", label: "Wanted" },
                      ]
                    : [
                        { value: "For Sale", label: "For Sale" },
                        { value: "For Rent", label: "For Rent" },
                        { value: "Wanted", label: "Wanted" },
                      ]
                }
              />
            </div>

            {/* Dynamic Category-Specific Fields */}
            {categoryConfig && (
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-sm font-semibold text-text-primary mb-3">
                  Category Details
                </h3>
                <DynamicFormRenderer
                  config={categoryConfig}
                  values={attributes}
                  onChange={handleAttributeChange}
                  errors={formErrors}
                />
              </div>
            )}

            {isEdit && (
              <>
                {form.status === "pending" && !isAdmin && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    This listing is pending admin approval. It will be visible
                    once approved.
                  </div>
                )}
                {form.status === "suspended" && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    This listing has been suspended by an admin.
                  </div>
                )}
                <Select
                  label="Status"
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  options={
                    isAdmin
                      ? [
                          { value: "pending", label: "Pending" },
                          { value: "active", label: "Active" },
                          { value: "suspended", label: "Suspended" },
                          { value: "sold", label: "Sold" },
                          { value: "closed", label: "Closed" },
                        ]
                      : [
                          ...(form.status === "pending"
                            ? [
                                {
                                  value: "pending",
                                  label: "Pending (awaiting approval)",
                                },
                              ]
                            : []),
                          ...(form.status === "active"
                            ? [{ value: "active", label: "Active" }]
                            : []),
                          ...(form.status === "suspended"
                            ? [{ value: "suspended", label: "Suspended" }]
                            : []),
                          { value: "sold", label: "Sold" },
                          { value: "closed", label: "Closed" },
                        ]
                  }
                />
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                loading={loading}
                disabled={!isProfileComplete && !isEdit}
              >
                {isEdit ? "Update Listing" : "Submit for Review"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}
