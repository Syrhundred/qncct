import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "@/shared/types/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
};

export const verifyToken = createAsyncThunk(
  "auth/verifyToken",
  async (token: string) => {
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

    return data;
  },
);

// 📌 Асинхронный thunk для верификации номера телефона
export const verifyPhone = createAsyncThunk(
  "auth/verifyPhone",
  async (phone_number: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${baseUrl}/api/v1/auth/request-number-verification
`,
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

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// 📌 Асинхронный thunk для регистрации
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
    } catch (error: any) {
      return rejectWithValue(error.message);
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

      return data; // ✅ Теперь возвращаем `user`
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: { email: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(email),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, verification_code, new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      localStorage.removeItem("access_token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyPhone.fulfilled,
        (state, action: PayloadAction<{ phone: string }>) => {
          state.loading = false;
          if (state.user) {
            state.user.phone = action.payload.phone;
          }
        },
      )
      .addCase(verifyPhone.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyToken.fulfilled,
        (state, action: PayloadAction<{ token: string }>) => {
          state.loading = false;
          state.token = action.payload.token;
        },
      )
      .addCase(verifyToken.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        verifyCode.fulfilled,
        (
          state,
          action: PayloadAction<{
            access_token: string;
            user: { email: string; phone: string };
          }>,
        ) => {
          state.loading = false;
          state.token = action.payload.access_token; // Обновляем токен
          state.user = action.payload.user; // Обновляем пользователя
        },
      )
      .addCase(verifyCode.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(completeRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        completeRegistration.fulfilled,
        (
          state,
          action: PayloadAction<{ username: string; interests: string[] }>,
        ) => {
          state.loading = false;
          if (state.user) {
            state.user.username = action.payload.username;
            state.user.interests = action.payload.interests;
          }
        },
      )
      .addCase(
        completeRegistration.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      )
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyCodeResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCodeResetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(
        verifyCodeResetPassword.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
