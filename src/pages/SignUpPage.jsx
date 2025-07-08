import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          onClick={() => alert("Account created (dummy)")}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">Log In!</Link>
        </p>
      </div>
    </div>
  );
}
