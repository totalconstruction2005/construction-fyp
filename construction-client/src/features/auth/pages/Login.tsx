import React, { useState } from "react";
import { MyNavbar, Footer } from "@layouts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";

type LoginLocationState = {
  returnTo?: string;
};

const Login: React.FC = () => {
  const { login, user, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errorMessage, isError, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as LoginLocationState | null)?.returnTo || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const nextUser = await login(email.trim(), password);
      const destination = nextUser.role === "admin" ? "/admin/dashboard" : "/";
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      handleError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
        <MyNavbar transparent={false} />
        <main className="flex-grow flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md text-center text-sm text-gray-600">
            Checking session...
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user) {
    const destination = user.role === "admin" ? "/admin/dashboard" : "/my-projects";

    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
        <MyNavbar transparent={false} />
        <main className="flex-grow flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md text-center">
            <h1 className="text-xl font-semibold text-gray-800">You are already logged in</h1>
            <p className="text-sm text-gray-600 mt-2">Click below to go to your projects.</p>
            <button
              type="button"
              onClick={() => navigate(destination, { replace: true })}
              className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md"
            >
              Go to Projects
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
      <MyNavbar transparent={false} />
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Login</h1>
          {isError && (
            <ErrorAlert
              title="Login failed"
              message={errorMessage || "Login failed"}
              onClose={clearError}
              className="mb-4"
            />
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded-md p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="w-full border border-gray-300 rounded-md p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1">
                <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md">Login</button>
          </form>
          <p className="text-sm text-gray-600 mt-4">
            No account? <Link to="/signup" state={{ returnTo }} className="text-emerald-600 hover:underline">Create one</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
