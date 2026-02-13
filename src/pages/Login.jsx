import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!formData.username || !formData.password) {
    setError("Please fill all fields");
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(
      "https://sz02nvjz-3000.inc1.devtunnels.ms/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      }
    );

    const data = await res.json();
    console.log("Login API Response:", data); // 👈 DEBUG

    if (!res.ok) {
      setError(data.message || "Invalid username or password");
      return;
    }

const token =
  data.token ||
  data.access_token ||
  data.accessToken ||
  data?.data?.token ||
  data?.data?.access_token;

if (!token) {
  console.error("Full API response:", data);
  setError("Login succeeded but token not found in response");
  return;
}

localStorage.setItem("token", token);


    // Redirect to dashboard
    navigate("/dashboard");
  } catch (error) {
    console.error("Login Error:", error);
    setError("Server not reachable or CORS issue.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl p-8">
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Central Health Dashboard
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Login to access monitoring panel
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-red-400 bg-red-900/20 border border-red-800 p-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Username
            </label>
            <input
              type="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 text-sm mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded-lg bg-[#020617] border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo Credentials */}
        
      </div>
    </div>
  );
};

export default Login;
