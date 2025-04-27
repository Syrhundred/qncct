import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserState } from "@/shared/types/types";
import { setCookie } from "@/shared/lib/cookies";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialState: AuthState = {
  user: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  loading: false,
  error: null,
  isAuth: false,
};

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/auth/verify-magic-link?token=${token}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      return { token: data.access_token, user: data.user };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

export const verifyPhone = createAsyncThunk(
  "auth/verifyPhone",
  async (phone_number: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/auth/request-number-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ phone_number }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return { phone_number };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

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
      const res = await fetch(`${baseUrl}/api/v1/auth/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ phone_number, verification_code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      return { token: data.access_token, user: data.user as UserState };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

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
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("is_active", "true");

      const jwt = JSON.parse(atob(data.access_token.split(".")[1]));
      const accessMaxAge =
        Math.max(jwt.exp * 1000 - Date.now(), 0) / 1000 || 60 * 60 * 24 * 7;

      setCookie("access_token", data.access_token, accessMaxAge);
      setCookie("refresh_token", data.refresh_token, accessMaxAge);
      setCookie("is_active", "true", 60 * 60 * 24 * 7);

      return { token: data.access_token, user: data.user as UserState };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

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
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

export const completeRegistration = createAsyncThunk(
  "auth/completeRegistration",
  async (
    { username, interests }: { username: string; interests: string[] },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/complete-registration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ username, interests }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return { username, interests };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: { email: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  },
);

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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error",
      );
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
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ token: string; user: UserState }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuth = true;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      .addCase(
        verifyToken.fulfilled,
        (state, action: PayloadAction<{ token: string; user: UserState }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuth = true;
        },
      )
      .addCase(
        verifyPhone.fulfilled,
        (state, action: PayloadAction<{ phone_number: string }>) => {
          state.loading = false;
          if (state.user) {
            state.user.phone_number = action.payload.phone_number;
          }
        },
      )
      .addCase(
        verifyCode.fulfilled,
        (state, action: PayloadAction<{ token: string; user: UserState }>) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user = action.payload.user;
        },
      )
      .addCase(
        completeRegistration.fulfilled,
        (
          state,
          action: PayloadAction<{ username: string; interests: string[] }>,
        ) => {
          state.loading = false;
          if (state.user) {
            state.user.profile.username = action.payload.username;
            state.user.profile.interests = action.payload.interests;
          }
        },
      )
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        (action): action is PayloadAction<string | null> =>
          action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
