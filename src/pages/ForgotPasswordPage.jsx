import React from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          onClick={() => alert("Confirmation code sent (dummy)")}
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Send Confirmation Code
        </button>
        <p className="mt-4 text-center text-sm">
          Back to <Link to="/" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
