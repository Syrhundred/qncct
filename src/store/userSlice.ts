import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { UserState } from "@/shared/types/types";

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
  followers_count: 0, // Added this missing property
  following_count: 0, // Added this missing property
  profile: {
    username: "",
    interests: [],
    avatar_url: "",
    about_me: "", // Added this missing property
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
    const res = await fetch(`${baseUrl}/api/v1/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch user");

    return data as UserState;
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
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ?? "Не удалось получить данные пользователя";
      });
  },
});

export default userSlice.reducer;
