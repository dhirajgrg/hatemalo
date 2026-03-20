import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";
import { Button, Input, Card } from "../../components/ui";
import GoogleLoginButton from "../../components/ui/GoogleLoginButton";
import NepalLocationInput from "../../components/ui/NepalLocationInput";

export default function RegisterPage() {
  const { register, googleLogin, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleError = location.state?.googleError;

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    location: "",
    whatsapp: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!form.name) errors.name = "Name is required";
    if (!form.email) errors.email = "Email is required";
    if (!form.location) errors.location = "Location is required";
    if (!form.password) errors.password = "Password is required";
    if (form.password.length < 6)
      errors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    if (!form.whatsapp) errors.whatsapp = "WhatsApp number is required";
    else if (!/^\d{10}$/.test(form.whatsapp))
      errors.whatsapp = "Enter a valid 10-digit number";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const errors = validate();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    try {
      const { confirmPassword, ...data } = form;
      data.whatsapp = `+977${data.whatsapp}`;
      await register(data);
      navigate("/");
    } catch {
      // error is set in context
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGoogleSuccess = async (accessToken) => {
    clearError();
    try {
      await googleLogin(accessToken, "register");
      navigate("/dashboard");
    } catch {
      // error is set in context
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <Card.Body className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Create account
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Join the Hatemalo marketplace
            </p>
          </div>

          {(googleError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {googleError
                ? `${googleError}. Please sign up with Google below.`
                : error}
            </div>
          )}

          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            label="Sign up with Google"
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-text-muted">
                Or register with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              error={formErrors.name}
              required
            />
            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={formErrors.email}
              required
            />
            <NepalLocationInput
              label="Location"
              value={form.location}
              onChange={(val) =>
                setForm((prev) => ({ ...prev, location: val }))
              }
              error={formErrors.location}
              required
            />
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                WhatsApp Number <span className="text-red-500">*</span>
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
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setForm((prev) => ({ ...prev, whatsapp: val }));
                  }}
                  className={`flex-1 rounded-r-lg border px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formErrors.whatsapp ? "border-red-500" : "border-border"
                  }`}
                />
              </div>
              {formErrors.whatsapp && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.whatsapp}
                </p>
              )}
            </div>
            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={formErrors.password}
              required
            />
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
            />
            <Button type="submit" className="w-full" loading={loading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
