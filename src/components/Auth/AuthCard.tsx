import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export const AuthCard: React.FC = () => {
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isLoginView) {
        if (!email || !password) {
          throw new Error("Please fill in all fields.");
        }
        await login(email, password);
      } else {
        if (!username || !email || !password || !confirmPassword) {
          throw new Error("Please fill in all fields.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        await register(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setEmail("");
    setPassword("");
    setUsername("");
    setConfirmPassword("");
    setError(null);
    setShowPassword(false);
  };

  return (
    <div className="relative h-screen w-full overflow-y-auto bg-surface-container-high select-none flex flex-col">
      {/* 3D Sphere Background Assets */}
      <div
        className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-cover bg-center opacity-40 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: "url('/bg-sphere-coral.png')" }}
      ></div>
      <div
        className="absolute bottom-[-15%] right-[-10%] w-[30rem] h-[30rem] bg-cover bg-center opacity-30 mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: "url('/bg-sphere-sage.png')" }}
      ></div>

      {/* Scrollable content wrapper with padding bottom to prevent overlap with footer */}
      <div className="w-full min-h-full flex flex-col items-center justify-center p-6 pb-28 relative z-10">
        {/* Main card */}
        <div className="relative my-auto w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-tactile p-8 flex flex-col gap-5 ring-1 ring-surface-variant">
          {/* Logo and title */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="PackdConnect"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                // Fallback logo if the public png is not loaded yet
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="40" cy="50" r="30" fill="%23FF6B35" opacity="0.85"/><circle cx="60" cy="50" r="30" fill="%238BA88E" opacity="0.85"/></svg>';
              }}
            />
            <div className="text-[18px] font-extrabold text-on-surface tracking-tight mt-2">
              Packd<span className="font-normal">Connect</span>
            </div>
            <div className="mt-3">
              <h1 className="text-[24px] font-bold text-on-surface tracking-tight leading-tight">
                {isLoginView ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-[13px] text-on-surface-variant mt-1.5">
                {isLoginView
                  ? "Enter your details to access your account."
                  : "Join PackdConnect chat & calling"}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-[13px] font-medium p-3.5 rounded-[12px] border border-[#ffb4ab] text-center">
              {error}
            </div>
          )}

          {/* Form inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLoginView && (
              <div className="input-group">
                <label className="input-label">Username</label>
                <div className="input-field-container">
                  <User size={18} className="input-icon-left" />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-field-container">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-label-container">
                <label className="input-label">Password</label>
                {isLoginView && (
                  <a
                    href="#forgot"
                    className="text-[12px] font-semibold text-primary hover:text-[#E0531F] no-underline"
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="input-field-container">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLoginView && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-field-container">
                  <Lock size={18} className="input-icon-left" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full h-[48px] justify-center mt-2 rounded-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5 font-bold">
                  {isLoginView ? "Sign In" : "Sign Up"}
                  <span className="text-[16px] leading-none mb-0.5">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center text-[14px]">
            <span className="text-on-surface-variant">
              {isLoginView
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="font-bold text-primary hover:text-[#E0531F] bg-transparent border-none p-0 cursor-pointer"
              onClick={toggleView}
              disabled={isSubmitting}
            >
              {isLoginView ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Footer Pill */}
      <div className="floating-footer-pill">
        <span>© 2024 PackdConnect. All rights reserved.</span>
        <span className="separator">|</span>
        <a href="#privacy">Privacy Policy</a>
        <span className="separator">|</span>
        <a href="#terms">Terms of Service</a>
        <span className="separator">|</span>
        <a href="#help">Help Center</a>
      </div>
    </div>
  );
};
