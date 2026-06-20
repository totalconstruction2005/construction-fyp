import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";
import { authService } from "@shared/api/authService";
import { Eye, EyeOff, CheckCircle, Circle, Lock } from "lucide-react";

interface LocationState {
  email?: string;
  code?: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email || "";
  const code = state?.code || "";

  const { errorMessage, isError, handleError, clearError } = useErrorHandler();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if no credentials
  useEffect(() => {
    if (!email || !code) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, code, navigate]);

  // Password strength validation
  const getPasswordStrengthIssues = () => {
    const issues = [];
    if (newPassword.length < 8) issues.push("At least 8 characters");
    if (!/[A-Z]/.test(newPassword)) issues.push("One uppercase letter");
    if (!/[a-z]/.test(newPassword)) issues.push("One lowercase letter");
    if (!/[0-9]/.test(newPassword)) issues.push("One number");
    return issues;
  };

  const isPasswordStrong = getPasswordStrengthIssues().length === 0;
  const passwordsMatch = newPassword === confirmPassword;
  const isFormValid = isPasswordStrong && passwordsMatch && newPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (!isFormValid) {
      if (!isPasswordStrong) {
        handleError(new Error("Password does not meet requirements"));
        return;
      }
      if (!passwordsMatch) {
        handleError(new Error("Passwords do not match"));
        return;
      }
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(email, code, newPassword, confirmPassword);
      setIsSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", {
          state: { resetSuccess: true },
          replace: true,
        });
      }, 2000);
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
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                Create New Password
              </h1>

              <p className="text-sm text-gray-600 text-center mb-6">
                Enter a strong password to secure your account.
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
                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">
                      Password Requirements:
                    </p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2 text-xs">
                        {newPassword.length >= 8 ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={newPassword.length >= 8 ? "text-emerald-700" : "text-gray-500"}>
                          At least 8 characters
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        {/[A-Z]/.test(newPassword) ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={/[A-Z]/.test(newPassword) ? "text-emerald-700" : "text-gray-500"}>
                          One uppercase letter
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        {/[a-z]/.test(newPassword) ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={/[a-z]/.test(newPassword) ? "text-emerald-700" : "text-gray-500"}>
                          One lowercase letter
                        </span>
                      </li>
                      <li className="flex items-center gap-2 text-xs">
                        {/[0-9]/.test(newPassword) ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-300" />
                        )}
                        <span className={/[0-9]/.test(newPassword) ? "text-emerald-700" : "text-gray-500"}>
                          One number
                        </span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="text-sm">
                    {passwordsMatch ? (
                      <p className="text-emerald-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="text-red-600 flex items-center gap-2">
                        <Circle className="w-4 h-4" />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-emerald-600 hover:underline">
                  Back to Login
                </Link>
              </p>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-emerald-100 p-4 rounded-full">
                    <div className="w-8 h-8 text-emerald-600 flex items-center justify-center text-xl">
                      ✓
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Password Reset Successfully!
                </h2>

                <p className="text-sm text-gray-600 mb-2">
                  Your password has been updated. You can now login with your new password.
                </p>

                <p className="text-xs text-gray-500">
                  Redirecting to login page...
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

export default ResetPasswordPage;
