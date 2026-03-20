import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  googleAuth: (accessToken, source) =>
    api.post("/auth/google", { accessToken, source }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }),
};

export const categoryService = {
  getAll: () => api.get("/category"),
  getById: (id) => api.get(`/category/${id}`),
  create: (data) => api.post("/category", data),
  update: (id, data) => api.patch(`/category/${id}`, data),
  delete: (id) => api.delete(`/category/${id}`),
};

export const configService = {
  getByCategory: (categoryId) => api.get(`/category-config/${categoryId}`),
  getAll: () => api.get("/category-config"),
  create: (data) => api.post("/category-config", data),
  update: (categoryId, data) =>
    api.patch(`/category-config/${categoryId}`, data),
  delete: (categoryId) => api.delete(`/category-config/${categoryId}`),
};

export const statsService = {
  get: () => api.get("/listings/stats"),
};

export const listingService = {
  getAll: (params) => api.get("/listings", { params }),
  getById: (id) => api.get(`/listings/${id}`),
  getMine: () => api.get("/listings/me/listings"),
  create: (data) =>
    api.post("/listings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.patch(`/listings/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/listings/${id}`),
  updateStatus: (id, data) => api.patch(`/listings/${id}/status`, data),
};

export const userService = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) =>
    api.patch("/users/me", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProfile: () => api.delete("/users/me"),
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  deleteById: (id) => api.delete(`/users/${id}`),
  updateActiveStatus: (id, data) => api.patch(`/users/${id}/active`, data),
  updateRole: (id, data) => api.patch(`/users/${id}/role`, data),
};
