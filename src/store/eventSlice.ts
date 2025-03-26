import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Event } from "@/shared/types/types";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CreateEventPayload {
  // banner: string;
  // images: string[];
  name: string;
  category_id: string;
  address: string;
  latitude: number;
  longitude: number;
  date: string | null;
  description: string;
}

export const createEvent = createAsyncThunk<Event, CreateEventPayload>(
  "event/createEvent",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("category_id", payload.category_id);
      formData.append("address", payload.address);
      formData.append("latitude", payload.latitude.toString());
      formData.append("longitude", payload.longitude.toString());
      formData.append("description", payload.description);
      if (payload.date) {
        formData.append("date", payload.date);
      }

      const res = await fetch(`${baseUrl}/api/v1/events/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          // 👇 НЕ УСТАНАВЛИВАЙ Content-Type — fetch сам его выставит
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data.message);
      }

      return data as Event;
    } catch (error) {
      console.error("CreateEvent error:", error);
      return rejectWithValue("Unexpected error while creating event");
    }
  },
);

interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    // SET
    setEvents(state, action: PayloadAction<Event[]>) {
      state.events = action.payload;
    },
    addEvent(state, action: PayloadAction<Event>) {
      state.events.push(action.payload);
    },
    updateEvent(state, action: PayloadAction<Event>) {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) state.events[index] = action.payload;
    },
    deleteEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
    setSelectedEvent(state, action: PayloadAction<Event | null>) {
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
      .addCase(createEvent.fulfilled, (state, action: PayloadAction<Event>) => {
        state.isLoading = false;
        state.error = null;
        state.events.push(action.payload); // или addEvent(state, action), если хочешь переиспользовать
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to create event";
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
