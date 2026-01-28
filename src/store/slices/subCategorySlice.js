import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import subCategoryService from "../../api/subCategoryService"; // You created this earlier
import toast from "react-hot-toast";

// --- THUNKS ---

export const fetchSubCategories = createAsyncThunk(
  "subCategories/fetchAll",
  async ({ contentType, categoryId } = {}, { rejectWithValue }) => {
    try {
      // Pass params to service
      const response = await subCategoryService.getAll(contentType, categoryId);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subcategories",
      );
    }
  },
);

export const createSubCategory = createAsyncThunk(
  "subCategories/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await subCategoryService.create(formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Creation failed",
      );
    }
  },
);

export const updateSubCategory = createAsyncThunk(
  "subCategories/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await subCategoryService.update(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  },
);

export const deleteSubCategory = createAsyncThunk(
  "subCategories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await subCategoryService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  },
);

// --- SLICE ---

const subCategorySlice = createSlice({
  name: "subCategories",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // Update
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default subCategorySlice.reducer;
