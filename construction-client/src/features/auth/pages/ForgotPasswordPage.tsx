import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";
import { authService } from "@shared/api/authService";
import { Mail, ArrowRight } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { errorMessage, isError, handleError, clearError } = useErrorHandler();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setIsSuccess(false);

    if (!email.trim()) {
      handleError(new Error("Please enter your email address"));
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.forgotPassword(email.trim().toLowerCase());

      if (result.success) {
        setIsSuccess(true);
        setEmail("");

        // Navigate to verify code page after 2 seconds
        setTimeout(() => {
          navigate("/reset-password/verify-code", {
            state: { email: email.trim().toLowerCase() },
         replace: true,
          });
        }, 2000);
      }
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
      <MyNavbar transparent={false} />
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          {!isSuccess ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-emerald-100 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Forgot Your Password?
              </h1>

              <p className="text-sm text-gray-600 text-center mb-6">
                Enter your email address and we'll send you a code to reset your password.
              </p>

              {isError && (
                <ErrorAlert
                  title="Error"
                  message={errorMessage || "An error occurred"}
                  onClose={clearError}
                  className="mb-4"
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send instructions to this email address
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Reset Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-sm text-gray-600 text-center mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                  Back to Login
                </Link>
              </p>

              <p className="text-xs text-gray-500 text-center mt-4">
                For your security, we won't confirm whether this email exists in our system.
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-emerald-100 p-4 rounded-full">
                    <div className="w-8 h-8 text-emerald-600 flex items-center justify-center">
                      ✓
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">Check Your Email</h2>

                <p className="text-sm text-gray-600 mb-2">
                  If an account exists with <strong>{email}</strong>, we've sent a password reset code.
                </p>

                <p className="text-xs text-gray-500">
                  The code will expire in 15 minutes. Redirecting you now...
                </p>

                <div className="mt-6 flex justify-center">
                  <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
