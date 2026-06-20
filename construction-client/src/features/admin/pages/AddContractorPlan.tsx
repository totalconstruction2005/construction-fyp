import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createContractorPlan, updateContractorPlan } from "../../../shared/api/contractorPlanService";

type ContractorPlan = {
  _id?: string;
  title: string;
  price: number;
  currency: string;
  tagline: string;
  features: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LocationState = {
  plan?: ContractorPlan;
};

const AddContractorPlan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const existingPlan = state?.plan;

  const [title, setTitle] = useState(existingPlan?.title ?? "");
  const [price, setPrice] = useState<number>(existingPlan?.price ?? 0);
  const [currency, setCurrency] = useState(existingPlan?.currency ?? "PKR");
  const [tagline, setTagline] = useState(existingPlan?.tagline ?? "");
  const [featuresText, setFeaturesText] = useState(
    existingPlan?.features.join("\n") ?? ""
  );
  const [isActive, setIsActive] = useState(existingPlan?.isActive ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const isEditing = useMemo(() => Boolean(existingPlan), [existingPlan]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();

    if (!trimmedTitle || price <= 0) {
      setError("Please provide a valid title and price greater than 0.");
      return;
    }

    const features = featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const planData = {
      title: trimmedTitle,
      price: Number(price),
      currency,
      tagline: tagline.trim(),
      features,
      isActive,
    };

    try {
      setIsLoading(true);
      
      if (isEditing && existingPlan?._id) {
        await updateContractorPlan(existingPlan._id, planData);
      } else {
        await createContractorPlan(planData);
      }
      
      navigate("/admin/settings/contractor-plans");
    } catch (err: any) {
      console.error("Error saving plan:", err);
      setError(err?.message || (err instanceof Error ? err.message : "Failed to save plan. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Settings</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          {isEditing ? "Edit Contractor Plan" : "Add Contractor Plan"}
        </h1>
        <p className="text-sm text-gray-600 mt-2">Create or update plan details for customers.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 max-w-3xl"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="plan-title">
            Title
          </label>
          <input
            id="plan-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-gray-400"
            placeholder="Enter plan title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="plan-price">
            Price
          </label>
          <input
            id="plan-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-gray-400"
            placeholder="50000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="plan-currency">
            Currency
          </label>
          <select
            id="plan-currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="PKR">PKR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="plan-tagline">
            Tagline
          </label>
          <input
            id="plan-tagline"
            type="text"
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-gray-400"
            placeholder="Short description"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="plan-features">
            Features (one per line)
          </label>
          <textarea
            id="plan-features"
            rows={5}
            value={featuresText}
            onChange={(event) => setFeaturesText(event.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-gray-400"
            placeholder="Up to 5 site visits"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="plan-isActive"
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
          />
          <label className="text-sm font-semibold text-gray-700" htmlFor="plan-isActive">
            Active (visible to customers)
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Add Plan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/settings/contractor-plans")}
            disabled={isLoading}
            className="px-5 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default AddContractorPlan;
