import React, { useEffect, useState } from "react";
import ErrorAlert from "@shared/components/ErrorAlert";
import DynamicCostBreakdown from "@features/estimator/components/DynamicCostBreakdown";
import {
  calculateEstimate,
  getEstimatorRegions,
  type CalculateResult,
  type EstimatorRegion,
} from "../../api/estimator.api";

const AREA_UNITS = ["Marla", "Kanal", "Sq Ft", "Sq Yard", "Sq Meter", "Acre"];

const EstimatorPreview: React.FC = () => {
  const [regions, setRegions] = useState<EstimatorRegion[]>([]);
  const [region, setRegion] = useState("");
  const [constructionType, setConstructionType] = useState<"grey" | "complete">("grey");
  const [mode, setMode] = useState<"with_material" | "without_material">("with_material");
  const [areaUnit, setAreaUnit] = useState("Marla");
  const [areaSize, setAreaSize] = useState("");
  const [coveredArea, setCoveredArea] = useState("");

  const [result, setResult] = useState<CalculateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEstimatorRegions();
        setRegions(data);
        if (data.length > 0) setRegion(data[0].name);
      } catch {
        setError("Failed to load regions.");
      }
    };
    void load();
  }, []);

  const handleCalculate = async () => {
    if (!region) {
      setError("Please select a region.");
      return;
    }
    if (!areaSize || !isFinite(parseFloat(areaSize)) || parseFloat(areaSize) <= 0) {
      setError("Please enter a valid area size.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const data = await calculateEstimate({
        region,
        constructionType,
        mode,
        areaUnit,
        areaSize: parseFloat(areaSize),
        coveredArea: coveredArea ? parseFloat(coveredArea) : undefined,
      });
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Calculation failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
          Estimator
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Estimate Preview</h1>
        <p className="text-sm text-gray-600 mt-2">
          Run a live cost calculation using the current saved regions and breakdown data.
        </p>
      </div>

      {/* Input Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Inputs</h2>

        {error && (
          <div className="mb-4">
            <ErrorAlert
              type="error"
              title="Preview Error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select Region</option>
              {regions.map((r) => (
                <option key={r._id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Unit</label>
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {AREA_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Area Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area Size</label>
            <input
              type="number"
              min={0}
              step="any"
              value={areaSize}
              onChange={(e) => setAreaSize(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. 10"
            />
          </div>

          {/* Covered Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Covered Area <span className="text-gray-400 text-xs">(Sq Ft, optional)</span>
            </label>
            <input
              type="number"
              min={0}
              step="any"
              value={coveredArea}
              onChange={(e) => setCoveredArea(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Leave blank to auto-convert"
            />
          </div>

          {/* Construction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Construction Type
            </label>
            <div className="flex gap-2">
              {(["grey", "complete"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setConstructionType(t)}
                  className={`px-3 py-2 text-sm rounded-full border font-medium ${
                    constructionType === t
                      ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t === "grey" ? "Grey Structure" : "Complete House"}
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <div className="flex gap-2">
              {(["with_material", "without_material"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-3 py-2 text-sm rounded-full border font-medium ${
                    mode === m
                      ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {m === "with_material" ? "With Material" : "Without Material"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? "Calculating..." : "Calculate"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total Cost</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                PKR {Number(result.totalCost).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Rate / Sq Ft</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                PKR {Number(result.ratePerSqFt).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Covered Area</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {Number(result.coveredArea).toLocaleString()} Sq Ft
              </p>
            </div>
          </div>

          {/* Root-level Summary */}
          {result.summary && result.summary.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.summary.map((item) => (
                <div
                  key={item.name}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
                >
                  <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    PKR {Number(item.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Full Breakdown Tree */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Full Breakdown</h2>
            <DynamicCostBreakdown breakdown={result.breakdown} />
          </div>
        </>
      )}
    </div>
  );
};

export default EstimatorPreview;
