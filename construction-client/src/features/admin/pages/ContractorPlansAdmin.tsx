import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContractorPlans, reorderContractorPlans, deleteContractorPlan } from "@shared/api/contractorPlanService";

type ContractorPlan = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  tagline: string;
  features: string[];
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
        console.error("Failed to load plans:", err);
        setError(err?.message || "Failed to load plans");
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const reordered = [...plans];
    const temp = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = temp;

    setPlans(reordered);

    try {
      await reorderContractorPlans(reordered.map((p) => p._id));
    } catch {
      setError("Failed to reorder plans");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === plans.length - 1) return;

    const reordered = [...plans];
    const temp = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = temp;

    setPlans(reordered);

    try {
      await reorderContractorPlans(reordered.map((p) => p._id));
    } catch {
      setError("Failed to reorder plans");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    try {
      await deleteContractorPlan(id);
      setPlans((prev) => prev.filter((plan) => plan._id !== id));
    } catch {
      setError("Failed to delete plan");
    }
  };

  const handleEdit = (plan: ContractorPlan) => {
    navigate("/admin/settings/contractor-plans/add", { state: { plan } });
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Settings</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Contractor Plans</h1>
            <p className="text-sm text-gray-600 mt-2">Manage the contractor plans shown to customers. Use arrows to reorder.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/settings/contractor-plans/add")}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
          >
            Add Contractor Plan
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {plans.map((plan, index) => (
          <div
            key={plan._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col relative"
          >
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                className={`p-1 rounded ${
                  index === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Move up"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                disabled={index === plans.length - 1}
                className={`p-1 rounded ${
                  index === plans.length - 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Move down"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex items-start justify-between mb-2 pr-8">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">{plan.title}</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{plan.tagline}</p>
              </div>
            </div>

            <div className="text-emerald-700 font-bold text-lg mb-4">
              {plan.currency} {plan.price.toLocaleString()}
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              {plan.features.map((feature, idx) => (
                <li key={`${plan._id}-feature-${idx}`} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEdit(plan)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(plan._id)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ContractorPlansAdmin;
