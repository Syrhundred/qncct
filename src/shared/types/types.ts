export interface UserLocationState {
  city: string | null;
  coords: { lat: number; lng: number } | null;
  error?: string | null; // 👈 добавляем
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

export interface IEvent {
  id: string;
  name: string;
  date: string;
  address: string;
  latitude: number;
  description: string;
  longitude: number;
  category: {
    id: string;
    name: string;
  };
  created_by: {
    id: string;
    email: string;
    phone_number: string;
    role: string;
    is_active: boolean;
    profile: {
      avatar_url: string;
      username: string;
      interests: string[];
    };
  };
  images: [
    {
      id: string;
      url: string;
      is_mine: boolean;
    },
  ];
}
