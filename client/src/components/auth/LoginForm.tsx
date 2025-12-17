import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/Button";
import { useAuthStore } from "../../store/authStore";
import { useForm } from "react-hook-form";
import type { User } from "../../types";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isAuthenticated, errors: LoginErrors } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();
  const navigate = useNavigate();

  const onSubmit = async () => {
    await login(email, password);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => LoginErrors);
    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Welcome Back!
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {LoginErrors.map((e, i) => (
            <div key={i} className="bg-red-400 text-white p-1 mb-2 rounded-md">
              {e}
            </div>
          ))}
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
              {...register("email", { required: true })}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {errors.email && (
              <div className="bg-red-400 p-1 text-white mt-2 rounded-md">
                Ingrese un correo válido{" "}
              </div>
            )}
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
              {...register("password", { required: true })}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {errors.password && (
              <div className="bg-red-400 p-1 text-white mt-2 rounded-md">
                Ingrese una contraseña válida{" "}
              </div>
            )}

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
