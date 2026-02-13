import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddServer from "./pages/Addserver";
import AddSystem from "./pages/AddSystem";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/add-server"
  element={
    <ProtectedRoute>
      <AddServer/>
    </ProtectedRoute>
  }
/>
<Route
  path="/add-system"
  element={
    <ProtectedRoute>
      <AddSystem />
    </ProtectedRoute>
  }
/>

    </Routes>
  );
}

export default App;
