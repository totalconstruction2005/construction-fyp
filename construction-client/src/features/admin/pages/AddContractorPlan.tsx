import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createContractorPlan,
  updateContractorPlan,
} from "../../../shared/api/contractorPlanService";

type ContractorPlan = {
  _id?: string;

  title: string;
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
  const [badge, setBadge] = useState(existingPlan?.badge ?? "");
  const [subtitle, setSubtitle] = useState(existingPlan?.subtitle ?? "");

  const [price, setPrice] = useState(existingPlan?.price ?? 0);
  const [currency, setCurrency] = useState(
    existingPlan?.currency ?? "Rs."
  );

  const [priceUnit, setPriceUnit] = useState(
    existingPlan?.priceUnit ?? "per sq ft"
  );

  const [estimateText, setEstimateText] = useState(
    existingPlan?.estimateText ?? ""
  );

  const [description, setDescription] = useState(
    existingPlan?.description ?? ""
  );

  const [includedText, setIncludedText] = useState(
    existingPlan?.includedFeatures?.join("\n") ?? ""
  );

  const [excludedText, setExcludedText] = useState(
    existingPlan?.excludedFeatures?.join("\n") ?? ""
  );

  const [timeline, setTimeline] = useState(
    existingPlan?.timeline ?? ""
  );

  const [idealFor, setIdealFor] = useState(
    existingPlan?.idealFor ?? ""
  );

  const [buttonText, setButtonText] = useState(
    existingPlan?.buttonText ?? "Select Package"
  );

  const [recommended, setRecommended] = useState(
    existingPlan?.recommended ?? false
  );

  const [theme, setTheme] = useState<
    "green" | "dark" | "gold" | "gray"
  >(existingPlan?.theme ?? "green");

  const [isActive, setIsActive] = useState(
    existingPlan?.isActive ?? true
  );

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const isEditing = useMemo(
    () => Boolean(existingPlan),
    [existingPlan]
  );

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const planData = {
      title,

      badge,

      subtitle,

      price: Number(price),

      currency,

      priceUnit,

      estimateText,

      description,

      includedFeatures: includedText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),

      excludedFeatures: excludedText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),

      timeline,

      idealFor,

      buttonText,

      recommended,

      theme,

      isActive,
    };

    try {
      setIsLoading(true);

      if (isEditing && existingPlan?._id) {
        await updateContractorPlan(
          existingPlan._id,
          planData
        );
      } else {
        await createContractorPlan(planData);
      }

      navigate("/admin/settings/contractor-plans");
    } catch (err: any) {
      setError(
        err?.message || "Failed to save plan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <>
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
        Settings
      </p>

      <h1 className="text-3xl font-bold text-gray-900 mt-1">
        {isEditing ? "Edit Contractor Plan" : "Add Contractor Plan"}
      </h1>

      <p className="text-sm text-gray-600 mt-2">
        Create contractor pricing packages.
      </p>
    </div>

    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6"
    >
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* BASIC DETAILS */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="font-semibold">Title</label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Badge</label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            placeholder="MOST AFFORDABLE"
            value={badge}
            onChange={(e)=>setBadge(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Subtitle</label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            placeholder="Foundation to Roof Slab"
            value={subtitle}
            onChange={(e)=>setSubtitle(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Price</label>

          <input
            type="number"
            className="w-full mt-2 border rounded-xl p-3"
            value={price}
            onChange={(e)=>setPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="font-semibold">Currency</label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            value={currency}
            onChange={(e)=>setCurrency(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Price Unit</label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            value={priceUnit}
            onChange={(e)=>setPriceUnit(e.target.value)}
          />
        </div>

      </div>

      {/* DESCRIPTION */}

      <div>

        <label className="font-semibold">

          Estimate Text

        </label>

        <input
          className="w-full mt-2 border rounded-xl p-3"
          value={estimateText}
          onChange={(e)=>setEstimateText(e.target.value)}
        />

      </div>

      <div>

        <label className="font-semibold">

          Description

        </label>

        <textarea
          rows={4}
          className="w-full mt-2 border rounded-xl p-3"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

      </div>

      {/* FEATURES */}

      <div className="grid md:grid-cols-2 gap-6">

        <div>

          <label className="font-semibold">

            Included Features
            <span className="text-sm text-gray-500">
              (one per line)
            </span>

          </label>

          <textarea
            rows={8}
            className="w-full mt-2 border rounded-xl p-3"
            value={includedText}
            onChange={(e)=>setIncludedText(e.target.value)}
          />

        </div>

        <div>

          <label className="font-semibold">

            Excluded Features
            <span className="text-sm text-gray-500">
              (one per line)
            </span>

          </label>

          <textarea
            rows={8}
            className="w-full mt-2 border rounded-xl p-3"
            value={excludedText}
            onChange={(e)=>setExcludedText(e.target.value)}
          />

        </div>

      </div>

      {/* FOOTER */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-semibold">

            Timeline

          </label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            value={timeline}
            onChange={(e)=>setTimeline(e.target.value)}
          />

        </div>

        <div>

          <label className="font-semibold">

            Button Text

          </label>

          <input
            className="w-full mt-2 border rounded-xl p-3"
            value={buttonText}
            onChange={(e)=>setButtonText(e.target.value)}
          />

        </div>

      </div>

      <div>

        <label className="font-semibold">

          Ideal For

        </label>

        <textarea
          rows={3}
          className="w-full mt-2 border rounded-xl p-3"
          value={idealFor}
          onChange={(e)=>setIdealFor(e.target.value)}
        />

      </div>

      <div className="grid md:grid-cols-3 gap-5">

        <div>

          <label className="font-semibold">

            Theme

          </label>

          <select
            className="w-full mt-2 border rounded-xl p-3"
            value={theme}
            onChange={(e)=>setTheme(e.target.value as any)}
          >
            <option value="green">Green</option>
            <option value="dark">Dark</option>
            <option value="gold">Gold</option>
            <option value="gray">Gray</option>
          </select>

        </div>

        <div className="flex items-center gap-3 mt-8">

          <input
            type="checkbox"
            checked={recommended}
            onChange={(e)=>setRecommended(e.target.checked)}
          />

          <label>

            Recommended Package

          </label>

        </div>

        <div className="flex items-center gap-3 mt-8">

          <input
            type="checkbox"
            checked={isActive}
            onChange={(e)=>setIsActive(e.target.checked)}
          />

          <label>

            Active

          </label>

        </div>

      </div>

      <div className="flex gap-3 pt-5">

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-xl font-semibold"
        >
          {isLoading
            ? "Saving..."
            : isEditing
            ? "Save Changes"
            : "Create Plan"}
        </button>

        <button
          type="button"
          onClick={()=>navigate("/admin/settings/contractor-plans")}
          className="px-6 py-3 border rounded-xl"
        >
          Cancel
        </button>

      </div>

    </form>
  </>
);

};

export default AddContractorPlan;