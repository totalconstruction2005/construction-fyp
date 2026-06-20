import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";

const ContractorRequestSuccess: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const planNames: Record<string, string> = {
    basic: "Basic",
    standard: "Standard",
    premium: "Premium",
  };

  const planName = planNames[planId || ""] || "Contractor";

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col pt-16">
      <MyNavbar transparent={false} />

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your request. You will receive an email and message soon.
          </p>

          {/* Plan Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-emerald-900">
              <span className="font-semibold">{planName} Plan</span> selected
            </p>
          </div>

          {/* Details */}
          <div className="bg-gray-50 rounded-lg px-4 py-4 mb-6 text-left">
            <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mb-2">
              Next Steps
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <span>Check your email for confirmation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                <span>A contractor will review your request</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-600 font-bold">3.</span>
                <span>You'll receive contact from our team shortly</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate("/construct-your-house")}
              className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              View Other Plans
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContractorRequestSuccess;
