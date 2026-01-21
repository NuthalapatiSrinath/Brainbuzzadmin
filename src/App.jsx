import React, { useEffect } from "react"; // Import useEffect
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux"; // Import Redux hook
import AppRoutes from "./routes/AppRoutes";

function App() {
  const { mode } = useSelector((state) => state.theme);

  // Apply theme class to HTML tag on initial load
  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            // Dynamic toast styles
            background: mode === "dark" ? "#334155" : "#333",
            color: "#fff",
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
