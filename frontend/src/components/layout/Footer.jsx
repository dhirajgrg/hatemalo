import { Link } from "react-router-dom";
import { useAuth } from "../../context";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-surface-dark text-text-inverse mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 mb-4 cursor-pointer"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold">Hatemalo</span>
            </Link>
            <p className="text-sm text-text-muted">
              Your trusted marketplace for jobs and products. Buy, sell, and
              connect with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2">
              <FooterLink to="/listings">Browse Listings</FooterLink>
              <FooterLink to="/categories">Categories</FooterLink>
              <FooterLink to="/listings/new">Post a Listing</FooterLink>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-2">
              {!isAuthenticated && (
                <>
                  <FooterLink to="/login">Sign In</FooterLink>
                  <FooterLink to="/register">Create Account</FooterLink>
                </>
              )}
              <FooterLink to="/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              <FooterLink to="/">About</FooterLink>
              <FooterLink to="/">Contact</FooterLink>
              <FooterLink to="/">Privacy Policy</FooterLink>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-dark mt-8 pt-8 text-center">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Hatemalo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <li>
      <Link
        to={to}
        onClick={handleClick}
        className="text-sm text-text-muted hover:text-text-inverse transition-colors cursor-pointer"
      >
        {children}
      </Link>
    </li>
  );
}
