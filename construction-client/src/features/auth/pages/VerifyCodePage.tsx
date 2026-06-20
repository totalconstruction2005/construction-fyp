import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { ErrorAlert } from "@shared/components";
import useErrorHandler from "@shared/hooks/useErrorHandler";
import { authService } from "@shared/api/authService";
import { Lock } from "lucide-react";

interface LocationState {
  email?: string;
}

const VerifyCodePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email || "";

  const { errorMessage, isError, handleError, clearError } = useErrorHandler();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const inputRef = useRef<HTMLInputElement>(null);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCodeChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    // Limit to 6 digits
    const limitedDigits = digits.slice(0, 6);
    setCode(limitedDigits);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();

    if (code.length !== 6) {
      handleError(new Error("Reset code must be 6 digits"));
      return;
    }

    setIsLoading(true);

    try {
      await authService.verifyResetCode(email, code);

      // Navigate to reset password page
      navigate("/reset-password/new-password", {
        state: { email, code },
        replace: true,
      });
    } catch (err: unknown) {
      handleError(err);
      setCode("");
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    clearError();

    try {
      await authService.forgotPassword(email);
      setTimeLeft(15 * 60); // Reset timer
      setCode("");
      inputRef.current?.focus();
    } catch (err: unknown) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = timeLeft <= 0;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 pt-16">
      <MyNavbar transparent={false} />
      <main className="flex-grow flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-100 p-4 rounded-full">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            Enter Reset Code
          </h1>

          <p className="text-sm text-gray-600 text-center mb-6">
            We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
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
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Reset Code
              </label>
              <input
                ref={inputRef}
                id="code"
                type="text"
                inputMode="numeric"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                disabled={isLoading || isExpired}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 text-center text-2xl letter-spacing font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit code from your email
              </p>
            </div>

            {/* Timer Display */}
            <div className="text-center">
              {isExpired ? (
                <p className="text-sm font-medium text-red-600">
                  ❌ Code has expired
                </p>
              ) : (
                <p className={`text-sm font-medium ${timeLeft < 300 ? "text-red-600" : "text-gray-600"}`}>
                  ⏱️ Code expires in {formatTime(timeLeft)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || isExpired}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium text-sm disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            <a href="/forgot-password" className="hover:underline">
              Wrong email? Start over
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCodePage;
