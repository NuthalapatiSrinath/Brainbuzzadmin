import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import toast from "react-hot-toast";

// --- Async Thunk for Login ---
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Hit your backend endpoint
      const response = await api.post("/admin/auth/login", { email, password });

      // Your backend returns: { admin_token, user: {...} }
      return response.data;
    } catch (error) {
      // Handle backend error messages
      const message = error.response?.data?.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

// --- Initial State ---
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const token = localStorage.getItem("token");

const initialState = {
  user: user,
  token: token,
  isAuthenticated: !!token,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Pending
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Login Success
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;

        // Save data from your specific backend response
        state.user = action.payload.user;
        state.token = action.payload.admin_token; // Mapping admin_token -> token

        // Persist to LocalStorage
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("token", action.payload.admin_token);

        toast.success(`Welcome back, ${action.payload.user.email}`);
      })
      // Login Failed
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
