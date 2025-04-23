// store/slices/userLocationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserLocationState } from "@/shared/types/types";

const initialState: UserLocationState = {
  city: null,
  coords: null,
  error: null,
};

const userLocationSlice = createSlice({
  name: "userLocation",
  initialState,
  reducers: {
    setUserLocation(state, action: PayloadAction<UserLocationState>) {
      state.city = action.payload.city;
      state.coords = action.payload.coords;
      state.error = action.payload.error ?? null;
    },
  },
});

export const { setUserLocation } = userLocationSlice.actions;
export default userLocationSlice.reducer;
