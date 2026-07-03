"use client";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ApiErrorResponse {
  error: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await authApi.signIn({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(result.user));
      }
      router.push("/home");
    } catch (error) {
      console.error("Sign in error:", error);
      const axiosError = error as AxiosError<ApiErrorResponse>;
      setError(
        axiosError.response?.data?.error || "An error occurred during sign in"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleToSignUp = (): void => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("changeAuthTab", { detail: "signup" });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Text */}
      <div className="text-left mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Welcome Back!
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Log in now to continue your exciting bar prep journey and track your exam readiness!
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-2">
          <p className="text-red-700 text-xs font-semibold">{error}</p>
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
            placeholder="Input your email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="w-full pl-4 pr-11 py-3 bg-white border border-slate-200/50 shadow-sm rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
              placeholder="Input your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-4 w-4 text-amber-500 border-slate-250 rounded focus:ring-amber-500/20 disabled:cursor-not-allowed accent-amber-500"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-xs font-bold text-slate-700 select-none cursor-pointer"
            >
              Remember me
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.email || !formData.password}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-[#ff823c] hover:bg-[#e76e27] transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
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
            Don't have an account?{" "}
            <button
              type="button"
              onClick={toggleToSignUp}
              disabled={isLoading}
              className="text-amber-600 hover:text-amber-700 font-extrabold underline cursor-pointer disabled:cursor-not-allowed"
            >
              Sign Up
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
