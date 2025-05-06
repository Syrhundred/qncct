// src/store/Providers.tsx
"use client";
import { Provider } from "react-redux";
import { store } from "./index";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);
