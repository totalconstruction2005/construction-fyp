import React, { useState } from "react";
import { MyNavbar, Footer } from "@layouts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";

type SignupLocationState = {
  returnTo?: string;
};

const Signup: React.FC = () => {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { errorMessage, isError, handleError, clearError } = useErrorHandler();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as SignupLocationState | null)?.returnTo || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const result = await signup(name.trim(), email.trim(), password);
      if (result === "authenticated") {
        navigate(returnTo, { replace: true });
      } else {
        navigate("/login", { replace: true, state: { returnTo } });
      }
    } catch (err: unknown) {
      handleError(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
      <MyNavbar transparent={false} />
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Create Account</h1>
          {isError && (
            <ErrorAlert
              title="Signup failed"
              message={errorMessage || "Signup failed"}
              onClose={clearError}
              className="mb-4"
            />
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1" htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                className="w-full border border-gray-300 rounded-md p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md">Sign up</button>
          </form>
          <p className="text-sm text-gray-600 mt-4">
            Have an account? <Link to="/login" state={{ returnTo }} className="text-emerald-600 hover:underline">Login</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
