// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import bannerReducer from "./slices/bannerSlice";
import couponReducer from "./slices/couponSlice";
import orderReducer from "./slices/orderSlice";
// Import the new reducers
import categoryReducer from "./slices/categorySlice";
import subCategoryReducer from "./slices/subCategorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    banners: bannerReducer,
    coupons: couponReducer,
    orders: orderReducer,
    // Register them here:
    categories: categoryReducer,
    subCategories: subCategoryReducer,
  },
});
