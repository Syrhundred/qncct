export interface UserLocationState {
  city: string | null;
  coords: { lat: number; lng: number } | null;
}

export interface AuthState {
  user: {
    email: string;
    phone?: string;
    username?: string;
    interests?: string[];
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Event {
  id: string;
  name: string;
  category: string;
  locationName: string;
  locationCoordinates: [number, number];
  date: string;
  time: string;
}
