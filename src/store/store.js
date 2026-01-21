import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice"; // <--- Import this

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer, // <--- Add this line to enable the theme logic
  },
});

export default store;
