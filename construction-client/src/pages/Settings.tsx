import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@shared/api/authService";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";
import { Eye, EyeOff } from "lucide-react";
import { MyNavbar, Footer } from "@layouts";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { errorMessage, isError, handleError, clearError } = useErrorHandler();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setSuccessMessage("");

    setIsLoading(true);

    try {
      const result = await authService.changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (result.success) {
        setSuccessMessage(result.message || "Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/my-projects", { replace: true });
        }, 2000);
      }
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />
      <div className="flex-grow pt-10">
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Account</p>
              <h1 className="text-4xl font-bold text-gray-900 mt-2">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your account security and preferences</p>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

              {isError && (
                <ErrorAlert
                  title="Error"
                  message={errorMessage || "An error occurred"}
                  onClose={clearError}
                  className="mb-6"
                />
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your current password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all placeholder:text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="At least 8 characters with letter and number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all placeholder:text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Confirm your new password"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all placeholder:text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex-1 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-600 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:shadow-none"
                  >
                    {isLoading ? "Updating..." : "Change Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/my-projects", { replace: true })}
                    disabled={isLoading}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Security Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Security Recommendations</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Use a strong password with uppercase, lowercase, numbers, and symbols</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Never share your password or account credentials with anyone</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Change your password regularly to keep your account secure</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;
