import axios, { AxiosError } from "axios";

// Type definitions for API responses
interface ApiError {
  error: string;
}

interface SignUpRequest {
  fullName: string;
  email: string;
  password: string;
}

interface SignUpResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isApproved: boolean;
    createdAt: string;
  };
}

interface SignInRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignInResponse {
  message: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isApproved: boolean;
  };
  token: string;
}

interface SignOutResponse {
  message: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Token will be sent via HTTP-only cookies automatically
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  signUp: async (userData: SignUpRequest): Promise<SignUpResponse> => {
    const response = await api.post<SignUpResponse>("/signup", userData);
    return response.data;
  },

  signIn: async (credentials: SignInRequest): Promise<SignInResponse> => {
    const response = await api.post<SignInResponse>("/signin", credentials);
    return response.data;
  },

  signOut: async (): Promise<SignOutResponse> => {
    const response = await api.post<SignOutResponse>("/signout");
    return response.data;
  },
};
