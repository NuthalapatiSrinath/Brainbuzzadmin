import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import categoryService from "../../api/categoryService"; // You created this earlier
import toast from "react-hot-toast";

// --- THUNKS ---

// Fetch all categories (optionally filtered by contentType)
export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (contentType, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAll(contentType);
      return response.data; // Assuming API returns { data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await categoryService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Creation failed",
      );
    }
  },
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.update(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id; // Return ID to filter it out from state locally
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

// --- SLICE ---

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [], // Stores the list of categories
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload); // Add new item to list
      })

      // Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload; // Update item in list
        }
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default categorySlice.reducer;
