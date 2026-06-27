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

/* ── Reusable field wrappers ── */
const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({
  label, hint, children,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label}{" "}
      {hint && <span className="text-gray-400 font-normal">{hint}</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1b5e35]/30 focus:border-[#1b5e35] transition";

const AddContractorPlan: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const existingPlan = state?.plan;

  const [title, setTitle]               = useState(existingPlan?.title ?? "");
  const [badge, setBadge]               = useState(existingPlan?.badge ?? "");
  const [subtitle, setSubtitle]         = useState(existingPlan?.subtitle ?? "");
  const [price, setPrice]               = useState(existingPlan?.price ?? 0);
  const [currency, setCurrency]         = useState(existingPlan?.currency ?? "Rs.");
  const [priceUnit, setPriceUnit]       = useState(existingPlan?.priceUnit ?? "per sq ft");
  const [estimateText, setEstimateText] = useState(existingPlan?.estimateText ?? "");
  const [description, setDescription]   = useState(existingPlan?.description ?? "");
  const [includedText, setIncludedText] = useState(existingPlan?.includedFeatures?.join("\n") ?? "");
  const [excludedText, setExcludedText] = useState(existingPlan?.excludedFeatures?.join("\n") ?? "");
  const [timeline, setTimeline]         = useState(existingPlan?.timeline ?? "");
  const [idealFor, setIdealFor]         = useState(existingPlan?.idealFor ?? "");
  const [buttonText, setButtonText]     = useState(existingPlan?.buttonText ?? "Select Package");
  const [recommended, setRecommended]   = useState(existingPlan?.recommended ?? false);
  const [theme, setTheme]               = useState<"green" | "dark" | "gold" | "gray">(existingPlan?.theme ?? "green");
  const [isActive, setIsActive]         = useState(existingPlan?.isActive ?? true);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");

  const isEditing = useMemo(() => Boolean(existingPlan), [existingPlan]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required."); return; }

    const planData = {
      title, badge, subtitle,
      price: Number(price), currency, priceUnit,
      estimateText, description,
      includedFeatures: includedText.split("\n").map((x) => x.trim()).filter(Boolean),
      excludedFeatures: excludedText.split("\n").map((x) => x.trim()).filter(Boolean),
      timeline, idealFor, buttonText, recommended, theme, isActive,
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
      setError(err?.message || "Failed to save plan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Page header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-8">
        <p className="text-[11px] uppercase tracking-widest font-bold text-[#1b5e35]">
          Settings
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          {isEditing ? "Edit Contractor Plan" : "Add Contractor Plan"}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {isEditing ? "Update an existing pricing package." : "Create a new contractor pricing package."}
        </p>
      </div>

      {/* ── Form ── */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 space-y-8"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
            {error}
          </div>
        )}

        {/* Section: Basic Details */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Basic Details
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Title">
              <input
                className={inputCls}
                placeholder="e.g. Grey Structure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Badge">
              <input
                className={inputCls}
                placeholder="MOST AFFORDABLE"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
              />
            </Field>
            <Field label="Subtitle">
              <input
                className={inputCls}
                placeholder="Foundation to Roof Slab"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </Field>
            <Field label="Price">
              <input
                type="number"
                className={inputCls}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </Field>
            <Field label="Currency">
              <input
                className={inputCls}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </Field>
            <Field label="Price Unit">
              <input
                className={inputCls}
                placeholder="per sq ft"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Section: Description */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Description
          </p>
          <div className="space-y-5">
            <Field label="Estimate Text">
              <input
                className={inputCls}
                placeholder="*Estimate for Rawalpindi / Islamabad. Final quote after site visit."
                value={estimateText}
                onChange={(e) => setEstimateText(e.target.value)}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={4}
                className={inputCls}
                placeholder="Describe what this package offers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Section: Features */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Features
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Field label="Included Features" hint="(one per line)">
              <textarea
                rows={8}
                className={inputCls}
                placeholder={"Foundation & footings\nRCC columns & beams\nBrick masonry walls"}
                value={includedText}
                onChange={(e) => setIncludedText(e.target.value)}
              />
            </Field>
            <Field label="Excluded Features" hint="(one per line)">
              <textarea
                rows={8}
                className={inputCls}
                placeholder={"Plaster\nTiles & flooring\nPaint"}
                value={excludedText}
                onChange={(e) => setExcludedText(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Section: Additional Info */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Additional Info
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Timeline">
              <input
                className={inputCls}
                placeholder="4–6 months (5 Marla)"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              />
            </Field>
            <Field label="Button Text">
              <input
                className={inputCls}
                placeholder="Select Grey Structure"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Ideal For">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Clients who want to handle finishing independently"
                value={idealFor}
                onChange={(e) => setIdealFor(e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-gray-100" />

        {/* Section: Settings */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">
            Settings
          </p>
          <div className="grid md:grid-cols-3 gap-5 items-center">
            <Field label="Theme">
              <select
                className={inputCls}
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
              >
                <option value="green">Green</option>
                <option value="dark">Dark</option>
                <option value="gold">Gold</option>
                <option value="gray">Gray</option>
              </select>
            </Field>

            {/* Recommended toggle */}
            <label className="flex items-center gap-3 cursor-pointer mt-5 select-none">
              <div
                onClick={() => setRecommended((v) => !v)}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  recommended ? "bg-[#1b5e35]" : "bg-gray-200"
                } relative`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    recommended ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">Recommended Package</span>
            </label>

            {/* Active toggle */}
            <label className="flex items-center gap-3 cursor-pointer mt-5 select-none">
              <div
                onClick={() => setIsActive((v) => !v)}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  isActive ? "bg-[#1b5e35]" : "bg-gray-200"
                } relative`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="px-7 py-3 bg-[#1b5e35] hover:bg-[#154d2b] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isLoading ? "Saving…" : isEditing ? "Save Changes" : "Create Plan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/settings/contractor-plans")}
            className="px-7 py-3 border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
};

export default AddContractorPlan;
