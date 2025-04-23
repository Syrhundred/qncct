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
      formData.append("banner", payload.banner); // это File
      payload.images.forEach((file) => formData.append("images", file)); // это File[]
      formData.append("name", payload.name);
      formData.append("category_id", payload.category_id);
      formData.append("address", payload.address);
      formData.append("latitude", payload.latitude.toString());
      formData.append("longitude", payload.longitude.toString());
      formData.append("date", payload.date);
      formData.append("description", payload.description);

      const res = await fetch(`${baseUrl}/api/v1/events/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
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

export const fetchEvents = createAsyncThunk<IEvent[], void>(
  "event/fetchEvents",
  async () => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/events/`);
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
    setEvents(state, action: PayloadAction<IEvent[]>) {
      state.events = action.payload;
    },
    addEvent(state, action: PayloadAction<IEvent>) {
      state.events.push(action.payload);
    },
    updateEvent(state, action: PayloadAction<IEvent>) {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) state.events[index] = action.payload;
    },
    deleteEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
    setSelectedEvent(state, action: PayloadAction<IEvent | null>) {
      state.selectedEvent = action.payload;
    },

    // LOADING / ERROR (опционально)
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
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
          state.events.push(action.payload); // или addEvent(state, action), если хочешь переиспользовать
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
        state.error = action.error.message || "Failed to join event";
      });
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  setLoading,
  setError,
} = eventSlice.actions;

export default eventSlice.reducer;
