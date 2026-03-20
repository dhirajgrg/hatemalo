import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context";
import { HiMenu, HiX } from "react-icons/hi";
import Button from "../ui/Button";
import { optimizeImage } from "../../utils/imagekit";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-text-primary">
              Hatemalo
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/listings">Listings</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/categories/jobs">Jobs</NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate("/listings/new")}
                  >
                    + Post Listing
                  </Button>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-alt transition-colors">
                    {user?.profilePic ? (
                      <img
                        src={optimizeImage(user.profilePic, {
                          width: 100,
                          height: 100,
                          quality: 80,
                        })}
                        alt={user.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-surface-dark rounded-full flex items-center justify-center">
                        <span className="text-text-inverse text-xs font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {user?.name}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-surface rounded-lg border border-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1">
                      {!isAdmin && (
                        <DropdownLink to="/dashboard">Dashboard</DropdownLink>
                      )}
                      <DropdownLink to="/profile">Profile</DropdownLink>
                      {isAdmin && (
                        <DropdownLink to="/admin">Admin Panel</DropdownLink>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-surface-alt transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <MobileLink to="/" onClick={() => setMobileOpen(false)}>
              Home
            </MobileLink>
            <MobileLink to="/listings" onClick={() => setMobileOpen(false)}>
              Listings
            </MobileLink>
            <MobileLink to="/categories" onClick={() => setMobileOpen(false)}>
              Categories
            </MobileLink>
            <MobileLink
              to="/categories/jobs"
              onClick={() => setMobileOpen(false)}
            >
              Jobs
            </MobileLink>
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <MobileLink
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                  >
                    Dashboard
                  </MobileLink>
                )}
                <MobileLink to="/profile" onClick={() => setMobileOpen(false)}>
                  Profile
                </MobileLink>
                {!isAdmin && (
                  <MobileLink
                    to="/listings/new"
                    onClick={() => setMobileOpen(false)}
                  >
                    Post Listing
                  </MobileLink>
                )}
                {isAdmin && (
                  <MobileLink to="/admin" onClick={() => setMobileOpen(false)}>
                    Admin Panel
                  </MobileLink>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-surface-alt"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate("/register");
                    setMobileOpen(false);
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, children }) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-alt rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}

function DropdownLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-alt transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-alt"
    >
      {children}
    </Link>
  );
}
