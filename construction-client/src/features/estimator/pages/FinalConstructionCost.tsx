import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MyNavbar, Footer } from "@layouts";
import {
  PopularCalculations,
  DynamicCostBreakdown,
  DonutChart,
} from "../components";
import { useAuth } from "@features/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient";
import { generateEstimatePdf } from "../../../utils/generateEstimatePdf";

// ---- Types ----------------------------------------------------------------

type SummaryItem = { name: string; amount: number };

type BreakdownNodeResp = {
  _id: string;
  name: string;
  percentage: number;
  amount: number;
  notes?: string;
  children?: BreakdownNodeResp[];
};

type SectionSplit = {
  total: number;
  percentage: number;
  breakdown: BreakdownNodeResp[];
};

type EstimateResponse = {
  region: string;
  constructionType: string;
  mode: string;
  originalArea: number;
  areaSqft: number;
  coveredArea: number;
  ratePerSqFt: number;
  totalCost: number;
  summary: SummaryItem[];
  breakdown: BreakdownNodeResp[];
  chart: { label: string; value: number }[];
  split?: {
    grey: SectionSplit;
    finishing: SectionSplit;
  } | null;
};

type ApiEnvelope = {
  success: boolean;
  data: EstimateResponse;
  message?: string;
};

// ---- Constants -------------------------------------------------------------

const AREA_UNIT_OPTIONS = [
  "Marla",
  "Kanal",
  "Sq Ft",
  "Sq Yard",
  "Sq Meter",
  "Acre",
];

// ---- Helpers ---------------------------------------------------------------

const mapType = (label: string): "grey" | "complete" =>
  label === "Grey Structure" ? "grey" : "complete";

const mapMode = (label: string): "with_material" | "without_material" =>
  label === "With Material" ? "with_material" : "without_material";

/** Read a string param with a fallback */
const sp = (params: URLSearchParams, key: string, fallback: string) =>
  params.get(key) ?? fallback;

/** Read a positive-number param with a fallback */
const spNum = (params: URLSearchParams, key: string, fallback: number) => {
  const v = parseFloat(params.get(key) ?? "");
  return isFinite(v) && v > 0 ? v : fallback;
};

// ---- Component -------------------------------------------------------------

const FinalConstructionCost: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL is the single source of truth — read once on mount + whenever URL changes
  const region = sp(searchParams, "city", "Islamabad");
  const areaSize = spNum(searchParams, "area", 10);
  const areaUnit = sp(searchParams, "unit", "Marla");
  const constructionType = sp(searchParams, "type", "Grey Structure");
  const constructionMode = sp(searchParams, "mode", "With Material");
  const coveredArea = spNum(searchParams, "coveredArea", 0);

  const [estimate, setEstimate] = useState<EstimateResponse | null>(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"complete" | "grey" | "finishing">(
    "complete",
  );

  // Reset activeTab when constructionType changes
  useEffect(() => {
    setActiveTab("complete");
  }, [constructionType]);

  // ---- Update URL (without navigation/reload) ----------------------------

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // ---- Calculation -------------------------------------------------------

  const runCalculation = useCallback(async () => {
    if (!region || !areaSize) return;
    try {
      setLoadingEstimate(true);
      setError(null);
      const payload = {
        region,
        constructionType: mapType(constructionType),
        mode: mapMode(constructionMode),
        areaUnit,
        areaSize,
        coveredArea: coveredArea > 0 ? coveredArea : undefined,
      };
      const resp = await apiClient.post<ApiEnvelope>(
        "/api/estimator/calculate",
        payload,
      );
      if (resp?.data) {
        setEstimate(resp.data);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Failed to load estimate";
      setError(msg);
    } finally {
      setLoadingEstimate(false);
    }
  }, [
    region,
    areaSize,
    areaUnit,
    constructionType,
    constructionMode,
    coveredArea,
  ]);

  // Re-run whenever any URL param changes
  useEffect(() => {
    void runCalculation();
  }, [runCalculation]);

  // ---- Download ----------------------------------------------------------
const handleDownload = () => {
  if (!isAuthenticated) {
    navigate("/login", {
      state: {
        returnTo:
          window.location.pathname +
          window.location.search,
      },
    });

    return;
  }

  if (!estimate) return;

  generateEstimatePdf({
    estimate,
    region,
    areaSize,
    areaUnit,
    constructionType,
    constructionMode,
    coveredArea,
  });
};

  const isComplete = constructionType === "Complete";

  const viewData = useMemo(() => {
    if (!estimate) {
      return { breakdown: [], chart: [], total: 0, title: "Total Cost" };
    }

    if (!isComplete) {
      return {
        breakdown: estimate.breakdown || [],
        chart: (estimate.breakdown || []).map((node) => ({
          label: node.name,
          value: node.amount,
        })),
        total: estimate.totalCost,
        title: "Grey Structure Cost",
      };
    }

    if (activeTab === "grey") {
      const breakdown = estimate.split?.grey?.breakdown || [];
      return {
        breakdown,
        chart: breakdown.map((node) => ({
  label: node.name,
  value: node.amount,
  amount: node.amount,
})),
        total: estimate.split?.grey?.total || 0,
        title: "Grey Structure Cost",
      };
    } else if (activeTab === "finishing") {
      const breakdown = estimate.split?.finishing?.breakdown || [];
      return {
        breakdown,
        chart: breakdown.map((node) => ({
  label: node.name,
  value: node.amount,
  amount: node.amount,
})),
        total: estimate.split?.finishing?.total || 0,
        title: "Finishing Cost",
      };
    } else {
      const greyNode = estimate.breakdown.find(
        (n) => n.name === "Grey Structure",
      );

      const finishingNode = estimate.breakdown.find(
        (n) => n.name === "Finishing",
      );

      const chartNodes = [
        ...(greyNode?.children || []),
        ...(finishingNode?.children || []),
      ];

      return {
        breakdown: estimate.breakdown || [],

        chart: chartNodes.map((node) => ({
          label: node.name,
          value: node.amount,
          amount: node.amount,
        })),

        total: estimate.totalCost,
        title: "Complete House Cost",
      };
    }
  }, [estimate, isComplete, activeTab]);

  const heading = `${areaSize} ${areaUnit} House Construction Cost in ${region}`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <MyNavbar transparent={false} />

      <main className="flex-grow w-full pt-9">
        {/* Breadcrumb */}
        <div className="w-full max-w-6xl mx-auto mb-6 mt-6 px-3 sm:px-4 text-left">
          <nav className="text-xs text-gray-600" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <a href="/" className="hover:text-emerald-600">
                  Home
                </a>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <a href="/estimator" className="hover:text-emerald-600">
                  Construction Cost Calculator
                </a>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-medium">{heading}</li>
            </ol>
          </nav>
          <h1 className="text-2xl mt-2 font-extrabold">{heading}</h1>
        </div>

        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 flex flex-col lg:flex-row gap-6">
          {/* ---- Sidebar ------------------------------------------------- */}
          <aside className="w-full lg:w-80 h-auto lg:h-[82vh] p-5 px-3 lg:px-2 lg:overflow-y-auto flex flex-col lg:sticky lg:top-24">
            <h2 className="text-sm font-bold text-gray-400 mb-4">
              Quick Options
            </h2>

            {/* City */}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm mb-1">City</label>
              <select
                className="w-full px-3 py-2 text-sm bg-white focus:outline-none border-b border-gray-300 shadow-sm"
                value={region}
                onChange={(e) => updateParam("city", e.target.value)}
              >
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>

            {/* Area Size */}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm mb-1">
                Area Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="w-1/2 px-3 py-2 text-sm bg-white focus:outline-none border-b border-gray-300 shadow-sm"
                  value={areaSize}
                  onChange={(e) => updateParam("area", e.target.value)}
                />
                <select
                  className="w-1/2 px-2 py-2 text-sm bg-white focus:outline-none border-b border-gray-300 shadow-sm"
                  value={areaUnit}
                  onChange={(e) => updateParam("unit", e.target.value)}
                >
                  {AREA_UNIT_OPTIONS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Construction Type */}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm mb-1">
                Construction Type
              </label>
              <div className="flex gap-2">
                {["Grey Structure", "Complete"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateParam("type", t)}
                    className={`px-3 py-2 text-xs font-semibold rounded-full ${constructionType === t ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Construction Mode */}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm mb-1">
                Construction Mode
              </label>
              <div className="flex gap-2">
                {["With Material", "Without Material"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateParam("mode", m)}
                    className={`px-3 py-2 text-xs font-semibold rounded-full ${constructionMode === m ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Covered Area */}
            <div className="mb-5">
              <label className="block text-gray-600 text-sm mb-1">
                Covered Area
              </label>
              <input
                type="number"
                min={0}
                step="any"
                className="w-full px-3 py-2 text-sm bg-white focus:outline-none border-b border-gray-300 shadow-sm mb-1"
                value={coveredArea > 0 ? coveredArea : ""}
                placeholder="Leave blank to auto-convert"
                onChange={(e) => updateParam("coveredArea", e.target.value)}
              />
              <p className="text-xs text-gray-500">Sq.ft</p>
            </div>

            <div className="mt-auto">
              <button
                type="button"
                onClick={() => void runCalculation()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold"
              >
                {loadingEstimate ? "Calculating..." : "Calculate Cost"}
              </button>
            </div>
          </aside>

          {/* ---- Main Content -------------------------------------------- */}
          <div className="flex-grow flex flex-col">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow p-4 text-center col-span-2 sm:col-span-1">
                <p className="text-gray-500 text-sm">Total Cost</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {loadingEstimate
                    ? "Calculating..."
                    : estimate
                      ? `PKR ${Number(estimate.totalCost).toLocaleString()}`
                      : "—"}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm">Rate / Sq Ft</p>
                <p className="text-xl font-semibold">
                  {estimate
                    ? `PKR ${Number(estimate.ratePerSqFt).toLocaleString()}`
                    : "—"}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-gray-500 text-sm">Covered Area</p>
                <p className="text-xl font-semibold">
                  {estimate
                    ? `${Number(estimate.coveredArea).toLocaleString()} Sq Ft`
                    : "—"}
                </p>
              </div>
              {estimate?.summary?.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-xl shadow p-4 text-center"
                >
                  <p className="text-gray-500 text-sm truncate">{item.name}</p>
                  <p className="text-lg font-semibold">
                    PKR {Number(item.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Download + share */}
            <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(window.location.href);
                }}
                className="border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-md hover:bg-gray-50"
                aria-label="Copy shareable link"
              >
                Copy Link
              </button>
              <button
                onClick={handleDownload}
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-md shadow"
                aria-label="Download estimate"
              >
                Download Estimate
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}
            {/* Tab selector for Complete House */}
{estimate && !loadingEstimate && isComplete && (
  <div className="mb-4 flex gap-3">
    {(["complete", "grey", "finishing"] as const).map((tab) => {
      const isActive = activeTab === tab;

      const label =
        tab === "complete"
          ? "Complete"
          : tab === "grey"
          ? "Grey Structure"
          : "Finishing";

      return (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-5 py-2 rounded-full text-sm font-medium transition ${
            isActive
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
)}

{/* Donut Chart */}
{estimate && !loadingEstimate && (
  <DonutChart
    data={viewData.chart}
    total={viewData.total}
    title={viewData.title}
  />
)}

            {/* Breakdown */}
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Cost Breakdown —{" "}
                {isComplete
                  ? activeTab === "grey"
                    ? "Grey Structure"
                    : activeTab === "finishing"
                      ? "Finishing"
                      : "Complete House"
                  : "Grey Structure"}{" "}
                / {constructionMode} ({region})
              </h2>

              {loadingEstimate ? (
                <p className="text-gray-500">Calculating breakdown...</p>
              ) : estimate && viewData.breakdown?.length > 0 ? (
                <DynamicCostBreakdown breakdown={viewData.breakdown} />
              ) : estimate ? (
                <div className="px-4 py-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                  <p className="font-semibold mb-1">
                    No breakdown data available
                  </p>
                  <p>
                    No breakdown nodes have been configured for{" "}
                    <strong>
                      {region} / {mapType(constructionType)} /{" "}
                      {mapMode(constructionMode)}
                    </strong>{" "}
                    yet.
                  </p>
                  <p className="mt-1">
                    An admin can add the breakdown tree from the admin panel
                    under Estimator → Breakdown Tree.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <PopularCalculations />
      <Footer />
    </div>
  );
};

export default FinalConstructionCost;
