import { RootState } from "@/store/index";

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuth;

// export const authSelectors = {
//     selectIsAuthenticated,
//     selectUser: (state: RootState) => state.auth.user,
//     selectToken: (state: RootState) => state.auth.token,
//     selectAuthError: (state: RootState) => state.auth.error,
//     selectAuthLoading: (state: RootState) => state.auth.loading,
// };
