import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { useAuth } from "@features/auth";
import { getContractorPlans } from "../../../shared/api/contractorPlanService";

type Plan = {
  _id: string;
  title: string;
  slug: string;
  badge: string;
  subtitle: string;
  price: number;
  currency: string;
  priceUnit: string;
  estimateText: string;
  description: string;
  includedFeatures: string[];
  excludedFeatures: string[];
  timeline: string;
  idealFor: string;
  buttonText: string;
  recommended: boolean;
  theme: "green" | "dark" | "gold" | "gray";
  isActive: boolean;
  sortOrder: number;
};

const ContractorPlans: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getContractorPlans();
        setPlans(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load contractor plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const onSelect = (planId: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: `/hire/${planId}` } });
      return;
    }
    navigate(`/hire/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eaf4ea] flex flex-col">
        <MyNavbar transparent={false} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
            <p className="mt-3 text-sm text-gray-500">Loading Plans…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#eaf4ea] flex flex-col">
        <MyNavbar transparent={false} />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-red-100 text-red-700 p-5 rounded-lg text-sm">{error}</div>
        </main>
        <Footer />
      </div>
    );
  }

  const midIndex = Math.floor(plans.length / 2);

  return (
    <div className="min-h-screen bg-[#eaf4ea] flex flex-col">
      <MyNavbar transparent={false} />

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-14">

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Construct Your House</h1>
          <p className="mt-3 text-gray-500 text-base max-w-xl mx-auto">
            Choose the construction package that best fits your budget and requirements.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:items-start">
          {plans.map((plan, idx) => {
            const isMiddle = idx === midIndex;

            /* ══════════════════════════════════════
               GREEN middle card
            ══════════════════════════════════════ */
            if (isMiddle) {
              return (
                <div
                  key={plan._id}
                  className="rounded-2xl overflow-hidden flex flex-col shadow-2xl bg-[#1b5e35] border border-[#1b5e35] lg:-mt-4"
                >
                  {/* Badge strip */}
                  <div className="bg-[#154d2b] flex items-center justify-center gap-2 py-3 text-[11px] font-bold uppercase tracking-widest text-white">
                    <span>{plan.badge || "Most Popular"}</span>
                    <span className="border border-white/50 rounded-full px-3 py-0.5 text-[10px] font-semibold flex items-center gap-1">
                      ☆ Recommended
                    </span>
                  </div>

                  <div className="p-7 flex flex-col flex-1">

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-white leading-tight">{plan.title}</h2>
                    <p className="text-sm mt-1 text-green-200">{plan.subtitle}</p>

                    {/* Price — Rs. 4,000 per sq ft */}
                    <div className="mt-3 flex items-baseline gap-1 flex-wrap">
                      <span className="text-lg font-bold text-green-300">{plan.currency}</span>
                      <span className="text-5xl font-extrabold leading-none text-green-300">
                        {plan.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-green-300 ml-1">{plan.priceUnit}</span>
                    </div>

                    {plan.estimateText && (
                      <p className="text-xs italic mt-1 text-green-300">{plan.estimateText}</p>
                    )}
                    {plan.description && (
                      <p className="mt-2 text-sm leading-6 text-green-100">{plan.description}</p>
                    )}

                    {/* Included */}
                    <div className="mt-4">
                      <p className="text-[12px] font-bold uppercase tracking-widest mb-2.5 text-green-300">
                        What's Included
                      </p>
                      <ul className="space-y-1">
                        {(plan.includedFeatures ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-sm font-bold text-green-300 flex-shrink-0 mt-0.5">✓</span>
                            <span className="text-sm text-green-100">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Excluded */}
                    {(plan.excludedFeatures?.length ?? 0) > 0 && (
                      <div className="mt-4">
                        <p className="text-[12px] font-bold uppercase tracking-widest mb-2.5 text-green-300">
                          Not Included
                        </p>
                        <ul className="space-y-1">
                          {(plan.excludedFeatures ?? []).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-sm font-bold text-red-400 flex-shrink-0 mt-0.5">✕</span>
                              <span className="text-sm text-green-100">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timeline & Ideal For */}
                    <div className="border-t border-[#2d7a4a] mt-4 pt-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">🕐 Timeline</span>
                        <span className="text-sm text-green-200">{plan.timeline}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white">👤 Ideal For</span>
                        <p className="text-sm mt-0.5 text-green-200">{plan.idealFor}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelect(plan._id)}
                      className="mt-5 w-full py-3 rounded-xl text-sm font-bold tracking-wide bg-green-400 hover:bg-green-300 text-green-900 transition-colors"
                    >
                      {plan.buttonText || "Select Package"}
                    </button>
                  </div>
                </div>
              );
            }

            /* ══════════════════════════════════════
               WHITE side cards
            ══════════════════════════════════════ */
            return (
              <div
                key={plan._id}
                className="rounded-2xl overflow-hidden flex flex-col shadow-md bg-white border border-gray-200"
              >
                <div className="px-7 pt-7 pb-0">

                  {/* Small muted badge label — no strip, no border */}
                  {plan.badge && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                      {plan.badge}
                    </p>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{plan.title}</h2>
                  <p className="text-sm mt-1 text-gray-400">{plan.subtitle}</p>

                  {/* Price — Rs. 2,500 per sq ft inline */}
                  <div className="mt-6 flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">{plan.currency}</span>
                    <span className="text-5xl font-extrabold leading-none text-gray-900">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">{plan.priceUnit}</span>
                  </div>

                  {plan.estimateText && (
                    <p className="text-xs italic mt-1 text-gray-400">{plan.estimateText}</p>
                  )}
                  {plan.description && (
                    <p className="mt-2 text-sm leading-6 text-gray-600">{plan.description}</p>
                  )}
                </div>

                <div className="px-7 pb-7 flex flex-col flex-1">

                  {/* Included */}
                  <div className="mt-3">
                    <p className="text-[12px] font-bold uppercase tracking-widest mb-2.5 text-gray-400">
                      What's Included
                    </p>
                    <ul className="space-y-1">
                      {(plan.includedFeatures ?? []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="text-sm font-bold text-green-600 flex-shrink-0 mt-0.5">✓</span>
                          <span className="text-sm text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Excluded */}
                  {(plan.excludedFeatures?.length ?? 0) > 0 && (
                    <div className="mt-3">
                      <p className="text-[12px] font-bold uppercase tracking-widest mb-2.5 text-gray-400">
                        Not Included
                      </p>
                      <ul className="space-y-1">
                        {(plan.excludedFeatures ?? []).map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="text-sm font-bold text-red-400 flex-shrink-0 mt-0.5">✕</span>
                            <span className="text-sm text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timeline & Ideal For */}
                  <div className="border-t border-gray-100 mt-3 pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">🕐 Timeline</span>
                      <span className="text-sm text-gray-500">{plan.timeline}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">👤 Ideal For</span>
                      <p className="text-sm mt-0.5 text-gray-500">{plan.idealFor}</p>
                    </div>
                  </div>

                  {/* Dark green button matching inspo */}
                  <button
                    onClick={() => onSelect(plan._id)}
                    className="mt-3 w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide bg-[#1b5e35] hover:bg-[#154d2b] text-white transition-colors"
                  >
                    {plan.buttonText || "Select Package"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default ContractorPlans;
