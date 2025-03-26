import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Category {
  id: string;
  name: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async () => {
    // Make API call to fetch categories
    const response = await fetch(`${baseUrl}/api/v1/category/`);
    const data = await response.json();
    return data as Category[];
  },
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.isLoading = false;
          state.categories = action.payload;
        },
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Error fetching categories";
      });
  },
});

export default categorySlice.reducer;
