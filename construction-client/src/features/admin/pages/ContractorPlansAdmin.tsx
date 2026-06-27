import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getContractorPlans,
  reorderContractorPlans,
  deleteContractorPlan,
} from "@shared/api/contractorPlanService";

type ContractorPlan = {
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
  createdAt?: string;
  updatedAt?: string;
};

const ContractorPlansAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ContractorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getContractorPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load contractor plans.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...plans];
    [reordered[index], reordered[index - 1]] = [reordered[index - 1], reordered[index]];
    setPlans(reordered);
    try {
      await reorderContractorPlans(reordered.map((p) => p._id));
    } catch {
      setError("Failed to reorder plans.");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === plans.length - 1) return;
    const reordered = [...plans];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    setPlans(reordered);
    try {
      await reorderContractorPlans(reordered.map((p) => p._id));
    } catch {
      setError("Failed to reorder plans.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteContractorPlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete plan.");
    }
  };

  const handleEdit = (plan: ContractorPlan) => {
    navigate("/admin/settings/contractor-plans/add", { state: { plan } });
  };

  /* Badge strip color per theme */
  const getBadgeStyle = (theme: string) => {
    switch (theme) {
      case "gold":   return "bg-yellow-500 text-white";
      case "dark":   return "bg-gray-800 text-white";
      case "gray":   return "bg-gray-500 text-white";
      default:       return "bg-[#1b5e35] text-white";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
          <p className="mt-3 text-sm text-gray-500">Loading plans…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-bold text-[#1b5e35]">
              Settings
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              Contractor Plans
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage contractor pricing packages.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/settings/contractor-plans/add")}
            className="px-6 py-3 rounded-xl bg-[#1b5e35] hover:bg-[#154d2b] text-white text-sm font-semibold transition-colors"
          >
            + Add Contractor Plan
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Colored badge strip */}
            <div
              className={`px-5 py-3 flex justify-between items-center ${getBadgeStyle(plan.theme)}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {plan.badge || "Package"}
              </span>
              <span className="text-[11px] font-semibold opacity-80">
                #{index + 1}
              </span>
            </div>

            <div className="p-6 flex flex-col flex-1">

              {/* Title row */}
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {plan.title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">{plan.subtitle}</p>
                </div>
                <span
                  className={`text-[11px] px-3 py-1 rounded-full font-semibold flex-shrink-0 ${
                    plan.isActive
                      ? "bg-green-100 text-[#1b5e35]"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-gray-900">{plan.currency}</span>
                <span className="text-4xl font-extrabold text-gray-900 leading-none">
                  {plan.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 ml-1">{plan.priceUnit}</span>
              </div>

              {plan.estimateText && (
                <p className="mt-1.5 text-xs italic text-gray-400">{plan.estimateText}</p>
              )}

              {plan.description && (
                <p className="mt-4 text-sm text-gray-600 leading-5 line-clamp-3">
                  {plan.description}
                </p>
              )}

              {/* Feature counts & timeline */}
              <div className="mt-5 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Included Features</span>
                  <span className="text-sm font-bold text-[#1b5e35]">
                    {plan.includedFeatures?.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Excluded Features</span>
                  <span className="text-sm font-bold text-red-500">
                    {plan.excludedFeatures?.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Timeline</span>
                  <span className="text-sm text-gray-700">{plan.timeline}</span>
                </div>
              </div>

              {/* Ideal For */}
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                  Ideal For
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">{plan.idealFor}</p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  ↑ Move Up
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === plans.length - 1}
                  className="py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  ↓ Move Down
                </button>
                <button
                  onClick={() => handleEdit(plan)}
                  className="py-2.5 rounded-xl bg-[#1b5e35] hover:bg-[#154d2b] text-white text-sm font-semibold transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ContractorPlansAdmin;
