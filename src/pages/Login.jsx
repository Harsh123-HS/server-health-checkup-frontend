import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseUrl from "../BaseUrl";
import bgImg from "../assets/bg.png"; // 👈 your image

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
      `${BaseUrl}/api/auth/login`,
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
  <div
    className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden"
    style={{
      backgroundImage: `url(${bgImg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    {/* 🔥 Dark Overlay for readability */}
    <div className="absolute inset-0 bg-[#020617]/5 backdrop-blur-sm "></div>

    {/* 🔷 Login Card */}
    <div className="relative w-full max-w-md bg-[#0f172a]/80 border border-slate-700/60 
    rounded-2xl shadow-2xl p-8 backdrop-blur-xl">
      
      {/* Title */}
      <h2 className="text-2xl font-bold text-white text-center mb-2 tracking-wide">
        Central Health Dashboard
      </h2>
      <p className="text-gray-400 text-center mb-6 text-sm">
      Infrastructure Monitoring Panel
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-red-400 bg-red-900/20 border border-red-800 p-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-gray-300 text-sm mb-1">
            Username
          </label>
          <input
            type="text"   // ⚠️ fixed (was username)
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="w-full px-4 py-2 rounded-lg bg-[#020617]/70 border border-slate-600 
            text-white focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:border-blue-500 transition"
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
            className="w-full px-4 py-2 rounded-lg bg-[#020617]/70 border border-slate-600 
            text-white focus:outline-none focus:ring-2 focus:ring-blue-500 
            focus:border-blue-500 transition"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r 
          from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
          transition text-white font-semibold shadow-lg shadow-blue-900/30 
          disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login to Dashboard"}
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;
