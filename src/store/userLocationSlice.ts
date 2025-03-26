// store/slices/userLocationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserLocationState } from "@/shared/types/types";

const initialState: UserLocationState = {
  city: null,
  coords: null,
};

const userLocationSlice = createSlice({
  name: "userLocation",
  initialState,
  reducers: {
    setUserLocation(state, action: PayloadAction<UserLocationState>) {
      state.city = action.payload.city;
      state.coords = action.payload.coords;
    },
  },
});

export const { setUserLocation } = userLocationSlice.actions;
export default userLocationSlice.reducer;
