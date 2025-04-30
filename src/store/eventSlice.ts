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

// Fix: Use Record<string, string> to satisfy URLSearchParams requirements
type SearchParamsObject = Record<string, string>;

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
      const searchParams: SearchParamsObject = {};

      if (params) {
        // Используем либо date_filter, либо custom_date
        if (params.date_filter) {
          searchParams.date_filter = params.date_filter;
        } else if (params.custom_date) {
          searchParams.custom_date = params.custom_date;
        }

        if (params.lat !== undefined) {
          searchParams.lat = params.lat.toString();
        }

        if (params.lon !== undefined) {
          searchParams.lon = params.lon.toString();
        }

        if (params.radius_km !== undefined) {
          searchParams.radius_km = params.radius_km.toString();
        }

        if (params.search) {
          searchParams.search = params.search;
        }

        if (params.interests && params.interests.length > 0) {
          searchParams.interests = params.interests.join(",");
        }
      }

      const queryString =
        Object.keys(searchParams).length > 0
          ? "?" + new URLSearchParams(searchParams).toString()
          : "";

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
    try {
      const res = await fetch(`${baseUrl}/api/v1/events/${id}`);
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
    try {
      await fetch(`${baseUrl}/api/v1/events/${id}/join`);
    } catch (error) {
      console.error("Fetch event by id error:", error);
      throw new Error("Failed to fetch event by id");
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
          state.events = action.payload;
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

export const { setSelectedEvent } = eventSlice.actions;

export default eventSlice.reducer;
