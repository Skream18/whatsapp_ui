import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email && password) {
      onLogin({ name: email });
      navigate("/chat");
    } else {
      alert("Please enter both email and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            👁
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Log In
        </button>
        <div className="mt-4 flex justify-between text-sm">
          <Link to="/forgot" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
          <Link to="/signup" className="text-blue-600 hover:underline">
            Don’t have an account? Sign up!
          </Link>
        </div>
      </div>
    </div>
  );
}






