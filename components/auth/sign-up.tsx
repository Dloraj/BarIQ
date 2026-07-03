"use client";
import { useState } from "react";
import { Eye, EyeOff, UserPlus, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { AxiosError } from "axios";

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ApiErrorResponse {
  error: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    const inputValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: inputValue,
    }));

    if (error) setError("");
    if (success) setSuccess("");

    if (
      name === "confirmPassword" ||
      (name === "password" && formData.confirmPassword)
    ) {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(password === confirmPassword);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const combinedFullName = `${formData.firstName} ${formData.lastName}`.trim();
      const result = await authApi.signUp({
        fullName: combinedFullName,
        email: formData.email,
        password: formData.password,
      });

      setSuccess(result.message);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      });
      setPasswordMatch(true);

      setTimeout(() => {
        if (typeof window !== "undefined") {
          const event = new CustomEvent("changeAuthTab", { detail: "signin" });
          window.dispatchEvent(event);
        }
      }, 3000);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.error || "An error occurred during sign up"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToSignIn = (): void => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("changeAuthTab", { detail: "signin" });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-5">
      {/* Welcome Text */}
      <div className="text-left mb-5">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Welcome Explorer!
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Log in now to continue your exciting journey and unlock new adventures waiting for you!
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-2">
          <p className="text-red-700 text-xs font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-2 animate-pulse">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <p className="text-emerald-800 text-xs font-bold">{success}</p>
          </div>
          <p className="text-emerald-600/80 text-[10px] mt-1 font-semibold">
            Redirecting to sign in...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name Fields Row */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="firstName"
              className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
              placeholder="Enter your first name"
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
              placeholder="Input Username"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            placeholder="Input your email"
            disabled={isLoading}
          />
        </div>

        {/* Phone Number Field */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
          >
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            placeholder="Enter your phone number"
            disabled={isLoading}
          />
        </div>

        {/* Password Row */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                placeholder="Input your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
            >
              Confirm
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-4 pr-10 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-sm font-medium ${
                  formData.confirmPassword && !passwordMatch
                    ? "border border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border border-slate-200/50 shadow-sm focus:ring-amber-500/20 focus:border-amber-500"
                }`}
                placeholder="Confirm"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            required
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="w-4 h-4 text-amber-500 border-slate-250 rounded focus:ring-amber-500/20 mt-0.5 disabled:cursor-not-allowed accent-amber-500"
            disabled={isLoading}
          />
          <label
            htmlFor="agreeToTerms"
            className="text-xs text-slate-500 leading-4 select-none cursor-pointer"
          >
            I agree to the{" "}
            <button
              type="button"
              className="text-amber-600 hover:text-amber-700 font-bold transition-colors cursor-pointer"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-amber-600 hover:text-amber-700 font-bold transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !passwordMatch || !formData.agreeToTerms}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#ff823c] hover:bg-[#e76e27] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </>
          )}
        </button>

        {/* Disclaimer subtext */}
        <p className="text-[10px] text-slate-400 text-center leading-relaxed mt-3">
          By continuing with Google, Apple, or Email, you agree to our{" "}
          <a href="#" className="underline font-semibold hover:text-slate-600">Terms of Service</a> and <a href="#" className="underline font-semibold hover:text-slate-600">Privacy Policy</a>.
        </p>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-[#fafaf6] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center py-2.5 px-4 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700 cursor-pointer"
          >
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.12.09 2.27-.58 2.94-1.39z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Bottom Toggle Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 font-semibold">
            Already have an account?{" "}
            <button
              type="button"
              onClick={toggleToSignIn}
              disabled={isLoading}
              className="text-amber-600 hover:text-amber-700 font-extrabold underline cursor-pointer disabled:cursor-not-allowed"
            >
              Sign In
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
