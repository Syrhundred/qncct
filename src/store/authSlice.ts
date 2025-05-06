import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ApiErrorShape, AuthState, UserState } from "@/shared/types/types";
import { setCookie } from "@/shared/lib/cookies";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialState: AuthState = {
  user: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  error: null,
  isAuth: false,
  loadingLogin: false,
  loadingRegister: false,
  loadingVerifyToken: false,
  loadingVerifyPhone: false,
  loadingVerifyCode: false,
  loadingCompleteRegistration: false,
  loadingFetchUserProfile: false,
};

/**
 * Utility function for error handling
 */
const handleError = (error: unknown) => {
  return error instanceof Error ? error.message : "Unknown error";
};

const isApiErrorShape = (data: unknown): data is ApiErrorShape =>
  typeof data === "object" && data !== null;

export const extractApiError = (data: unknown): string => {
  if (isApiErrorShape(data)) {
    return data.detail ?? data.message ?? data.error ?? "Unknown error";
  }
  return "Unknown error";
};

/**
 * Stores authentication tokens consistently across storage methods
 */
const storeAuthTokens = (
  accessToken: string,
  refreshToken: string,
  isActive: boolean,
) => {
  // Store in localStorage
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem("is_active", String(isActive));

  // Calculate token expiration
  const jwt = JSON.parse(atob(accessToken.split(".")[1]));
  const accessMaxAge =
    Math.max(jwt.exp * 1000 - Date.now(), 0) / 1000 || 60 * 60 * 24 * 7;

  // Store in cookies
  setCookie("access_token", accessToken, accessMaxAge);
  setCookie("refresh_token", refreshToken, accessMaxAge * 2); // Longer expiry for refresh token
  setCookie("is_active", String(isActive), 60 * 60 * 24 * 7);
};

/**
 * Clear all auth tokens
 */
const clearAuthTokens = () => {
  // Clear localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("is_active");

  // Clear cookies
  // removeCookie("access_token"); TODO: create removeCookie
  // removeCookie("refresh_token");
  // removeCookie("is_active");
};

/**
 * Verify magic token for login
 */
export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/auth/verify-magic-link?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok || !data?.access_token) {
        console.error("verifyToken error response:", res.status, data);
        return rejectWithValue(extractApiError(data));
      }

      // сохранить токены
      storeAuthTokens(data.access_token, data.refresh_token, data.is_active);

      return {
        token: data.access_token,
        refreshToken: data.refresh_token,
        isActive: data.is_active,
      };
    } catch (error) {
      console.error("verifyToken exception:", error);
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Make an authenticated request
 */
const authenticatedRequest = async (url: string, body: object) => {
  const token = localStorage.getItem("access_token");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(extractApiError(data));

  return data;
};

/**
 * Request phone verification
 */
export const verifyPhone = createAsyncThunk(
  "auth/verifyPhone",
  async (phone_number: string, { rejectWithValue }) => {
    try {
      await authenticatedRequest(
        `${baseUrl}/api/v1/auth/request-number-verification`,
        { phone_number },
      );

      return { phone_number };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Verify phone code
 */

export const verifyCode = createAsyncThunk(
  "auth/verifyCode",
  async (
    {
      phone_number,
      verification_code,
    }: { phone_number: string; verification_code: string },
    { rejectWithValue },
  ) => {
    try {
      const data = await authenticatedRequest(
        `${baseUrl}/api/v1/auth/verify-phone`,
        { phone_number, verification_code },
      );
      return { message: data.message ?? "Phone verified" };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Login user
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { identifier, password }: { identifier: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data));

      storeAuthTokens(data.access_token, data.refresh_token, data.is_active);

      return { token: data.access_token };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Register user
 */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data));

      return data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Complete user registration
 */
export const completeRegistration = createAsyncThunk(
  "auth/completeRegistration",
  async (
    { username, interests }: { username: string; interests: string[] },
    { rejectWithValue },
  ) => {
    try {
      await authenticatedRequest(
        `${baseUrl}/api/v1/auth/complete-registration`,
        { username, interests },
      );

      return { username, interests };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Request password reset
 */
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: { email: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data));

      return data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Reset password with verification code
 */
export const verifyCodeResetPassword = createAsyncThunk(
  "auth/verifyCodeResetPassword",
  async (
    {
      email,
      verification_code,
      new_password,
    }: { email: string; verification_code: string; new_password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verification_code, new_password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data));

      return data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

/**
 * Fetch current user profile
 */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No authentication token found");

      const res = await fetch(`${baseUrl}/api/v1/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractApiError(data));

      return { user: data };
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      clearAuthTokens();
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuth = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔐 Login user
      .addCase(loginUser.pending, (state) => {
        state.loadingLogin = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loadingLogin = false;
        state.token = action.payload.token;
        state.isAuth = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loadingLogin = false;
        state.error = action.payload as string;
      })

      // 🔑 Register user
      .addCase(registerUser.pending, (state) => {
        state.loadingRegister = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loadingRegister = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loadingRegister = false;
        state.error = action.payload as string;
      })

      // 🔎 Verify token (magic link)
      .addCase(verifyToken.pending, (state) => {
        state.loadingVerifyToken = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loadingVerifyToken = false;
        state.token = action.payload.token;
        state.isAuth = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loadingVerifyToken = false;
        state.error = action.payload as string;
      })

      // 📞 Request phone verification
      .addCase(verifyPhone.pending, (state) => {
        state.loadingVerifyPhone = true;
        state.error = null;
      })
      .addCase(verifyPhone.fulfilled, (state) => {
        state.loadingVerifyPhone = false;
      })
      .addCase(verifyPhone.rejected, (state, action) => {
        state.loadingVerifyPhone = false;
        state.error = action.payload as string;
      })

      // 🔢 Verify phone code
      .addCase(verifyCode.pending, (state) => {
        state.loadingVerifyCode = true;
        state.error = null;
      })
      .addCase(verifyCode.fulfilled, (state) => {
        state.loadingVerifyCode = false;
      })
      .addCase(verifyCode.rejected, (state, action) => {
        state.loadingVerifyCode = false;
        state.error = action.payload as string;
      })

      // ✅ Complete registration
      .addCase(completeRegistration.pending, (state) => {
        state.loadingCompleteRegistration = true;
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state) => {
        state.loadingCompleteRegistration = false;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loadingCompleteRegistration = false;
        state.error = action.payload as string;
      })

      // 👤 Fetch current user
      .addCase(fetchUserProfile.pending, (state) => {
        state.loadingFetchUserProfile = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<{ user: UserState }>) => {
          state.loadingFetchUserProfile = false;
          state.user = action.payload.user;
        },
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loadingFetchUserProfile = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
