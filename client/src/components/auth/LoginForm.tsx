import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import { authAPI } from "../../services/auth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    console.log(email,password);
    

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Welcome Back!
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-400 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full px-3 py-2 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
              id="password"
              type="password"
              name="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="text-right text-gray-500 text-xs mt-2">
              <a href="#" className="hover:text-purple-400">
                Forgot Password?
              </a>
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Button
              className="w-full bg-linear-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </Button>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-purple-400 hover:text-purple-300"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
