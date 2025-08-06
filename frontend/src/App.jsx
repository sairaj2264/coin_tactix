/*
 * AUTHENTICATION BYPASSED FOR DIRECT ACCESS
 *
 * The following changes have been made to allow direct access to all pages:
 * 1. ProtectedRoute and PublicRoute components now allow all access
 * 2. WebSocket initialization commented out (requires auth)
 * 3. Redux auth selectors commented out
 * 4. Default routes redirect to dashboard instead of login
 *
 * To re-enable authentication, uncomment the original code sections.
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout Components
import Layout from "./components/Layout/Layout";
import AuthLayout from "./components/Layout/AuthLayout";

// Page Components
import Dashboard from "./pages/Dashboard";
import StrategyEngine from "./pages/StrategyEngine";
import Backtesting from "./pages/Backtesting";
import Alerts from "./pages/Alerts";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Services - COMMENTED OUT FOR DIRECT ACCESS
// import { WebSocketService } from "./services/websocket";

// Protected Route Component - COMMENTED OUT FOR DIRECT ACCESS
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
//   return isAuthenticated ? children : <Navigate to="/login" replace />
// }

// Public Route Component (redirect if authenticated) - COMMENTED OUT FOR DIRECT ACCESS
// const PublicRoute = ({ children }) => {
//   const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
//   return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
// }

// Bypass components for demo - backend connected
const ProtectedRoute = ({ children }) => {
  return children; // Direct access for demo
};

const PublicRoute = ({ children }) => {
  return children; // Allow access to auth pages
};

function App() {
  // COMMENTED OUT - Redux selectors (not needed for direct access)
  // const dispatch = useDispatch();
  // const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // const currentSymbol = useSelector((state) => state.market.currentSymbol);

  // COMMENTED OUT - WebSocket initialization (requires authentication)
  // useEffect(() => {
  //   // Initialize WebSocket connection when authenticated
  //   if (isAuthenticated) {
  //     const wsService = WebSocketService.getInstance();
  //     wsService.connect();

  //     // Subscribe to real-time price updates
  //     wsService.subscribeToPrice(currentSymbol);

  //     // Cleanup on unmount
  //     return () => {
  //       wsService.disconnect();
  //     };
  //   }
  // }, [isAuthenticated, currentSymbol, dispatch]);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/strategy"
          element={
            <ProtectedRoute>
              <Layout>
                <StrategyEngine />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/backtesting"
          element={
            <ProtectedRoute>
              <Layout>
                <Backtesting />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <Alerts />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Layout>
                <Portfolio />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Default redirects - MODIFIED FOR DIRECT ACCESS */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch all route - MODIFIED FOR DIRECT ACCESS */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
