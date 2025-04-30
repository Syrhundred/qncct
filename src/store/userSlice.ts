import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserState } from "@/shared/types/types";
import { fetchWithAuth } from "@/shared/lib/fetchWithAuth";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ExtendedUserState extends UserState {
  loading: boolean;
  error: string | null;
}

const initialState: ExtendedUserState = {
  id: "",
  email: "",
  phone_number: "",
  role: "",
  is_active: false,
  followers_count: 0,
  following_count: 0,
  profile: {
    username: "",
    interests: [],
    avatar_url: "",
    about_me: "",
  },
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<
  UserState,
  void,
  { rejectValue: string }
>("user/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const res = await fetchWithAuth(`${baseUrl}/api/v1/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch user");

    // Ensure the response conforms to the UserState type
    const userData: UserState = {
      id: data.id || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      role: data.role || "",
      is_active: data.is_active || false,
      followers_count: data.followers_count || 0,
      following_count: data.following_count || 0,
      profile: {
        username: data.profile?.username || "",
        interests: data.profile?.interests || [],
        avatar_url: data.profile?.avatar_url || "",
        about_me: data.profile?.about_me || "",
      },
    };

    return userData;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error",
    );
  }
});

const userSlice = createSlice({
  name: "userSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCurrentUser.fulfilled,
        (state, action: PayloadAction<UserState>) => {
          state.loading = false;
          state.error = null;
          Object.assign(state, action.payload);
        },
      )

      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Не удалось получить данные пользователя";
      });
  },
});

export default userSlice.reducer;
