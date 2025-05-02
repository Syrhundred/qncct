export type ApiErrorShape = {
  detail?: string;
  message?: string;
  error?: string;
};

export interface UserLocationState {
  city: string | null;
  coords: { lat: number; lng: number } | null;
  error?: string | null; // 👈 добавляем
}

export interface AuthState {
  user: UserState | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuth: boolean;
}

export interface UserProfile {
  username: string;
  interests?: string[];
  avatar_url: string;
  about_me: string;
}

export interface UserState {
  id: string;
  email: string;
  phone_number?: string;
  role: string;
  is_active: boolean;
  followers_count: number;
  following_count: number;
  profile: UserProfile;
}

export interface IEvent {
  id: string;
  name: string;
  date: string;
  address: string;
  latitude: number;
  description: string;
  longitude: number;
  is_joined: boolean;
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
