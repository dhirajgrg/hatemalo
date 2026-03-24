import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "../components/layout";
import ProtectedRoute from "../components/guards/ProtectedRoute";

import HomePage from "../pages/home/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ListingsPage from "../pages/listings/ListingsPage";
import ListingDetailPage from "../pages/listings/ListingDetailPage";
import ListingFormPage from "../pages/listings/ListingFormPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import CategoryListingsPage from "../pages/categories/CategoryListingsPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProfilePage from "../pages/profile/ProfilePage";
import AdminPage from "../pages/admin/AdminPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import AboutPage from "../pages/about/AboutPage";
import ContactPage from "../pages/contact/ContactPage";
import PrivacyPolicyPage from "../pages/legal/PrivacyPolicyPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-email/:token", element: <VerifyEmailPage /> },
      { path: "listings", element: <ListingsPage /> },
      { path: "listings/:id", element: <ListingDetailPage /> },
      {
        path: "listings/new",
        element: (
          <ProtectedRoute>
            <ListingFormPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "listings/:id/edit",
        element: (
          <ProtectedRoute>
            <ListingFormPage />
          </ProtectedRoute>
        ),
      },
      { path: "categories", element: <CategoriesPage /> },
      { path: "categories/:slug", element: <CategoryListingsPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "privacy-policy", element: <PrivacyPolicyPage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
