import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IEvent } from "@/shared/types/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CreateEventPayload {
  banner: File;
  images: File[];
  name: string;
  category_id: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string;
  description: string;
}

interface EventState {
  events: IEvent[];
  selectedEvent: IEvent | null;
  isLoading: boolean;
  error: string | null;
}

interface FetchEventsParams {
  date_filter?: "today" | "tomorrow" | "this_week";
  custom_date?: string;
  lat?: number;
  lon?: number;
  radius_km?: number;
  interests?: string[];
  search?: string;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
};

export const createEvent = createAsyncThunk<IEvent, CreateEventPayload>(
  "event/createEvent",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("banner", payload.banner);
      payload.images.forEach((file) => formData.append("images", file));
      formData.append("name", payload.name);
      formData.append("category_id", payload.category_id);
      formData.append("address", payload.address);
      formData.append("latitude", payload.latitude.toString());
      formData.append("longitude", payload.longitude.toString());
      formData.append("date", payload.date);
      formData.append("description", payload.description);

      let accessToken = "";

      if (typeof window !== "undefined") {
        accessToken = localStorage.getItem("access_token") || "";
      }

      const res = await fetch(`${baseUrl}/api/v1/events/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message || "Create event failed");
      }

      return data as IEvent;
    } catch (error) {
      console.error("CreateEvent error:", error);
      return rejectWithValue("Unexpected error while creating event");
    }
  },
);

export const fetchEvents = createAsyncThunk<IEvent[], FetchEventsParams | void>(
  "event/fetchEvents",
  async (params) => {
    try {
      const searchParams = new URLSearchParams();

      if (params) {
        if (params.date_filter) {
          searchParams.append("date_filter", params.date_filter);
        } else if (params.custom_date) {
          searchParams.append("custom_date", params.custom_date);
        }

        if (params.lat !== undefined) {
          searchParams.append("lat", params.lat.toString());
        }

        if (params.lon !== undefined) {
          searchParams.append("lon", params.lon.toString());
        }

        if (params.radius_km !== undefined) {
          searchParams.append("radius_km", params.radius_km.toString());
        }

        if (params.search) {
          searchParams.append("search", params.search);
        }

        if (params.interests && params.interests.length > 0) {
          for (const interest of params.interests) {
            searchParams.append("interests", interest);
          }
        }
      }

      const queryString =
        searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";

      const res = await fetch(`${baseUrl}/api/v1/events/filter${queryString}`);
      const data = await res.json();

      return data as IEvent[];
    } catch (error) {
      console.error("Fetch events error:", error);
      throw new Error("Failed to fetch events");
    }
  },
);

export const fetchEventById = createAsyncThunk<IEvent, string>(
  "event/fetchEventById",
  async (id) => {
    let accessToken;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token") || "";
    }
    try {
      const res = await fetch(`${baseUrl}/api/v1/events/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();

      return data as IEvent;
    } catch (error) {
      console.error("Fetch event by id error:", error);
      throw new Error("Failed to fetch event by id");
    }
  },
);

export const joinEvent = createAsyncThunk(
  "event/joinEvent",
  async (id: string | undefined) => {
    let accessToken;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token") || "";
    }
    try {
      await fetch(`${baseUrl}/api/v1/events/${id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("join error", error);
      throw new Error("join error");
    }
  },
);

export const unjoinEvent = createAsyncThunk(
  "event/unjoinEvent",
  async (id: string | undefined) => {
    let accessToken;
    if (typeof window !== "undefined") {
      accessToken = localStorage.getItem("access_token") || "";
    }
    try {
      await fetch(`${baseUrl}/api/v1/events/${id}/unjoin`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.log(error);
      throw new Error("unjoin error");
    }
  },
);

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setSelectedEvent(state, action: PayloadAction<IEvent | null>) {
      state.selectedEvent = action.payload;
    },
    setEventJoinState(state, action: PayloadAction<boolean>) {
      if (state.selectedEvent) {
        state.selectedEvent.is_joined = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createEvent.fulfilled,
        (state, action: PayloadAction<IEvent>) => {
          state.isLoading = false;
          state.error = null;
          state.events.push(action.payload);
        },
      )
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to create event";
      })
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEvents.fulfilled,
        (state, action: PayloadAction<IEvent[]>) => {
          state.isLoading = false;
          state.error = null;
          state.events = Array.isArray(action.payload) ? action.payload : [];
        },
      )
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch events";
      })
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchEventById.fulfilled,
        (state, action: PayloadAction<IEvent>) => {
          state.isLoading = false;
          state.error = null;
          state.selectedEvent = action.payload;
        },
      )
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch event";
      })
      .addCase(joinEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinEvent.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(joinEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch event";
      });
  },
});

export const { setEventJoinState, setSelectedEvent } = eventSlice.actions;

export default eventSlice.reducer;
