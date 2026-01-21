import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import Layout from "../layouts/Layout";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

// Placeholder for missing pages (Prevents crashes)
const Placeholder = ({ title }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    <p className="text-slate-500 mt-2">This module is under development.</p>
  </div>
);

// --- 1. DEFINE ROUTES & TITLES HERE ---
export const appRoutes = [
  // Overview
  { path: "/", element: <Dashboard />, title: "Dashboard Overview" },

  // Inventory
  {
    path: "/inventory/products",
    element: <Placeholder title="Product Catalog" />,
    title: "Product Catalog",
  },
  {
    path: "/inventory/categories",
    element: <Placeholder title="Categories" />,
    title: "Category Management",
  },
  {
    path: "/inventory/stock",
    element: <Placeholder title="Stock Adjustment" />,
    title: "Stock Management",
  },

  // Business Logic
  {
    path: "/gold-rates",
    element: <Placeholder title="Gold Rates" />,
    title: "Daily Gold Rates",
  },
  {
    path: "/suppliers",
    element: <Placeholder title="Suppliers" />,
    title: "Supplier Directory",
  },

  // Sales
  {
    path: "/orders/new",
    element: <Placeholder title="New Order" />,
    title: "Create New Order",
  },
  {
    path: "/customers",
    element: <Placeholder title="Customers" />,
    title: "Customer Database",
  },

  // Management
  {
    path: "/finance/transactions",
    element: <Placeholder title="Transactions" />,
    title: "Financial Transactions",
  },
  {
    path: "/staff",
    element: <Placeholder title="Staff" />,
    title: "Staff & Karigars",
  },
  {
    path: "/reports",
    element: <Placeholder title="Reports" />,
    title: "Business Reports",
  },

  // System
  {
    path: "/settings",
    element: <Placeholder title="Settings" />,
    title: "System Settings",
  },
];

// --- 2. ROUTE COMPONENTS ---

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Generates routes automatically from the list above */}
        {appRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
