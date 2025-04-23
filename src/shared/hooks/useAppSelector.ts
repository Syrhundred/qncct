import { store } from "@/store";
import { useSelector } from "react-redux";

export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
