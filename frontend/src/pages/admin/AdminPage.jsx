import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService, categoryService, listingService } from "../../services";
import { useCategories } from "../../context";
import {
  Card,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Input,
  Select,
  Modal,
} from "../../components/ui";
import {
  HiOutlineUsers,
  HiOutlineFolder,
  HiOutlineShieldCheck,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlinePencil,
} from "react-icons/hi";

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const setTab = (t) => setSearchParams({ tab: t }, { replace: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Admin Panel</h1>
        <p className="text-text-secondary mt-1">Manage your marketplace</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        <TabButton
          active={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          <HiOutlineChartBar className="w-4 h-4" /> Overview
        </TabButton>
        <TabButton active={tab === "users"} onClick={() => setTab("users")}>
          <HiOutlineUsers className="w-4 h-4" /> Users
        </TabButton>
        <TabButton
          active={tab === "listings"}
          onClick={() => setTab("listings")}
        >
          <HiOutlineClipboardList className="w-4 h-4" /> Listings
        </TabButton>
        <TabButton
          active={tab === "categories"}
          onClick={() => setTab("categories")}
        >
          <HiOutlineFolder className="w-4 h-4" /> Categories
        </TabButton>
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "listings" && <ListingsTab />}
      {tab === "categories" && <CategoriesTab />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap
        ${
          active
            ? "border-primary-600 text-primary-600"
            : "border-transparent text-text-secondary hover:text-text-primary"
        }`}
    >
      {children}
    </button>
  );
}

/* ────────────────── Overview Tab ────────────────── */
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, listingsRes, catsRes] = await Promise.all([
          userService.getAll(),
          listingService.getAll({ limit: 1 }),
          categoryService.getAll(),
        ]);
        const users = usersRes.data.data.users;
        const categories = catsRes.data.data.categories;
        const totalListings = listingsRes.data.total || 0;
        const totalCategories = categories.length;
        const totalSubs = categories.reduce(
          (acc, c) => acc + (c.subcategories?.length || 0),
          0,
        );
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u) => u.isActive).length,
          adminUsers: users.filter((u) => u.role === "admin").length,
          totalListings,
          totalCategories,
          totalSubs,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spinner className="py-12" />;
  if (!stats) return null;

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: <HiOutlineUsers className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: <HiOutlineShieldCheck className="w-6 h-6" />,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Admin Users",
      value: stats.adminUsers,
      icon: <HiOutlineShieldCheck className="w-6 h-6" />,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Total Listings",
      value: stats.totalListings,
      icon: <HiOutlineClipboardList className="w-6 h-6" />,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Parent Categories",
      value: stats.totalCategories,
      icon: <HiOutlineFolder className="w-6 h-6" />,
      color: "text-teal-600 bg-teal-50",
    },
    {
      label: "Subcategories",
      value: stats.totalSubs,
      icon: <HiOutlineFolder className="w-6 h-6" />,
      color: "text-pink-600 bg-pink-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <Card.Body className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-text-secondary">{card.label}</p>
              <p className="text-2xl font-bold text-text-primary">
                {card.value}
              </p>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

/* ────────────────── Users Tab ────────────────── */
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      const { data } = await userService.getAll(params);
      setUsers(data.data.users);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const toggleActive = async (id, isActive) => {
    await userService.updateActiveStatus(id, { isActive: !isActive });
    fetchUsers(searchTerm);
  };

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Are you sure you want to make this user ${newRole === "admin" ? "an admin" : "a regular user"}?`,
      )
    )
      return;
    await userService.updateRole(id, { role: newRole });
    fetchUsers(searchTerm);
  };

  if (loading && users.length === 0) return <Spinner className="py-12" />;

  return (
    <>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
        {searchTerm && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              fetchUsers();
            }}
          >
            Clear
          </Button>
        )}
      </form>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Name
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Email
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Role
                </th>
                <th className="text-left px-6 py-3 font-medium text-text-secondary">
                  Status
                </th>
                <th className="text-right px-6 py-3 font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-border last:border-0 hover:bg-surface-alt"
                >
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === "admin" ? "primary" : "default"}>
                      {u.role === "admin" && (
                        <HiOutlineShieldCheck className="w-3 h-3 mr-1" />
                      )}
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.isActive ? "success" : "danger"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRole(u._id, u.role)}
                      >
                        {u.role === "admin" ? "Demote" : "Make Admin"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(u._id, u.isActive)}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ────────────────── Listings Tab ────────────────── */
function ListingsTab() {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    postedBy: "",
    status: "",
  });

  const buildParams = useCallback(
    (p = 1, f = filters) => {
      const params = { page: p, limit: 20 };
      if (f.search.trim()) params.search = f.search.trim();
      if (f.category) params.category = f.category;
      if (f.postedBy.trim()) params.postedBy = f.postedBy.trim();
      if (f.status) {
        params.status = f.status;
      } else {
        // Admin should see all statuses by default
        params.status = "all";
      }
      return params;
    },
    [filters],
  );

  const fetchListings = useCallback(
    async (p = 1, f) => {
      setLoading(true);
      try {
        const params = f ? buildParams(p, f) : buildParams(p);
        const { data } = await listingService.getAll(params);
        setListings(data.data.listings);
        setTotalPages(data.pages || 1);
        setPage(data.page || 1);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(1, filters);
  };

  const handleClear = () => {
    const empty = { search: "", category: "", postedBy: "", status: "" };
    setFilters(empty);
    fetchListings(1, empty);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    await listingService.delete(id);
    fetchListings(page, filters);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await listingService.updateStatus(id, { status: newStatus });
      fetchListings(page, filters);
    } catch {
      // silent
    }
  };

  const hasFilters =
    filters.search || filters.category || filters.postedBy || filters.status;

  // Build category options: parent + subcategories
  const categoryOptions = categories.reduce((acc, parent) => {
    acc.push({ value: parent._id, label: parent.name });
    if (parent.subcategories) {
      parent.subcategories.forEach((sub) => {
        acc.push({ value: sub._id, label: `  ↳ ${sub.name}` });
      });
    }
    return acc;
  }, []);

  if (loading && listings.length === 0) return <Spinner className="py-12" />;

  return (
    <>
      <form onSubmit={handleSearch} className="space-y-3 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Title or listing ID..."
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
          />
          <Select
            placeholder="All categories"
            value={filters.category}
            onChange={(e) =>
              setFilters((p) => ({ ...p, category: e.target.value }))
            }
            options={categoryOptions}
          />
          <Input
            placeholder="Posted by (name)..."
            value={filters.postedBy}
            onChange={(e) =>
              setFilters((p) => ({ ...p, postedBy: e.target.value }))
            }
          />
          <Select
            placeholder="All statuses"
            value={filters.status}
            onChange={(e) =>
              setFilters((p) => ({ ...p, status: e.target.value }))
            }
            options={[
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" },
              { value: "sold", label: "Sold" },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Search
          </Button>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </form>

      {listings.length === 0 ? (
        <EmptyState
          icon={<HiOutlineClipboardList className="w-12 h-12" />}
          title="No listings found"
          description={
            hasFilters
              ? "Try different filters."
              : "No listings have been created yet."
          }
        />
      ) : (
        <>
          <Card>
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
                      Posted By
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-text-secondary">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr
                      key={l._id}
                      className="border-b border-border last:border-0 hover:bg-surface-alt"
                    >
                      <td className="px-6 py-4 font-medium text-text-primary max-w-50 truncate">
                        {l.title}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {l.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-text-primary">
                        Rs. {l.price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            l.status === "active"
                              ? "success"
                              : l.status === "pending"
                                ? "warning"
                                : l.status === "suspended"
                                  ? "danger"
                                  : l.status === "sold"
                                    ? "default"
                                    : "danger"
                          }
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {l.createdBy?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle: active ↔ suspended (or pending → active) */}
                          {(l.status === "pending" ||
                            l.status === "active" ||
                            l.status === "suspended") && (
                            <label
                              className="relative inline-flex items-center cursor-pointer"
                              title={
                                l.status === "active"
                                  ? "Suspend listing"
                                  : "Activate listing"
                              }
                            >
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={l.status === "active"}
                                onChange={() =>
                                  handleStatusChange(
                                    l._id,
                                    l.status === "active"
                                      ? "suspended"
                                      : "active",
                                  )
                                }
                              />
                              <div className="w-9 h-5 bg-red-500 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                            </label>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/listings/${l._id}/edit`)}
                            title="Edit"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/listings/${l._id}`)}
                            title="View"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            title="Delete"
                            onClick={() => handleDelete(l._id)}
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchListings(p, filters)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary-600 text-white"
                      : "bg-surface-alt text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ────────────────── Categories Tab ────────────────── */
function CategoriesTab() {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    loading,
  } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", parent: "" });

  const openCreate = (parentId = "") => {
    setEditId(null);
    setForm({ name: "", parent: parentId });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, parent: cat.parent || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editId) {
        await updateCategory(editId, { name: form.name });
      } else {
        await createCategory({ name: form.name, parent: form.parent || null });
      }
      setModalOpen(false);
    } catch {
      // error handled in context
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category and its subcategories?")) return;
    await deleteCategory(id);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button size="sm" onClick={() => openCreate()}>
          + Add Category
        </Button>
      </div>

      {loading ? (
        <Spinner className="py-12" />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={<HiOutlineFolder className="w-12 h-12" />}
          title="No categories"
          description="Create the first category to get started."
        />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat._id}>
              <Card.Body>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    {cat.name}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCreate(cat._id)}
                    >
                      + Sub
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(cat._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {cat.subcategories?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border space-y-2">
                    {cat.subcategories.map((sub) => (
                      <div
                        key={sub._id}
                        className="flex items-center justify-between pl-6"
                      >
                        <span className="text-sm text-text-secondary">
                          ↳ {sub.name}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(sub)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(sub._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Category" : "New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            id="cat-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Electronics"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editId ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
