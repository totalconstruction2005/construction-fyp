import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@shared/api/authService";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { errorMessage, isError, handleError, clearError } = useErrorHandler();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

        // Redirect to settings after 2 seconds
        setTimeout(() => {
          navigate("/admin/settings", { replace: true });
        }, 2000);
      }
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h1>

        {isError && (
          <ErrorAlert
            title="Error"
            message={errorMessage || "An error occurred"}
            onClose={clearError}
            className="mb-4"
          />
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
            <p className="text-sm text-emerald-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your current password"
              className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 placeholder:text-xs"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading}
              placeholder="At least 8 characters with letter and number"
              className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 placeholder:text-xs"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Confirm your new password"
              className="w-full border border-gray-300 rounded-md p-2 placeholder-gray-400 placeholder:text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:bg-teal-600 text-white font-semibold py-2 rounded-md transition-colors"
          >
            {isLoading ? "Updating..." : "Change Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/settings", { replace: true })}
            disabled={isLoading}
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-semibold py-2 rounded-md transition-colors"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
