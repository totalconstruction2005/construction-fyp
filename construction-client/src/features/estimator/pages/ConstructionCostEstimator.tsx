import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { MyNavbar } from "@layouts";
import { PopularCalculations, Instructions } from "../components";
import { Footer } from "@layouts";
import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Accessible TooltipIcon
 * - Uses a <button> for keyboard accessibility
 * - Closes on outside click and Escape
 * - aria-expanded / aria-controls included
 */
const TooltipIcon: React.FC<{ text: string; id?: string }> = memo(({ text, id }) => {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const tooltipId = id ?? `tooltip-${Math.random().toString(36).slice(2, 9)}`;

  const handleDocumentClick = useCallback((e: MouseEvent) => {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(e.target as Node) &&
      btnRef.current &&
      !btnRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleDocumentClick, handleKeyDown]);

  return (
    <div className="relative inline-block" aria-haspopup="dialog" aria-owns={tooltipId}>
      <button
        type="button"
        ref={btnRef}
        aria-expanded={open}
        aria-controls={tooltipId}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="ml-2 inline-flex items-center justify-center p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Info size={14} className="text-gray-400 cursor-pointer select-none" />
      </button>

      <div
        id={tooltipId}
        role="dialog"
        ref={tooltipRef}
        className={`absolute bottom-full mb-1 w-max max-w-[240px] bg-gray-700 text-white text-xs rounded-lg px-2 py-1 z-20 transition-opacity duration-150 ease-in-out ${
          open ? "opacity-100 block" : "opacity-0 pointer-events-none hidden"
        }`}
      >
        {text}
      </div>
    </div>
  );
});

const ConstructionCostEstimator: React.FC = () => {
  const [city, setCity] = useState<string>("Islamabad");
  const [area, setArea] = useState<string>(""); // keep as string for controlled numeric input
  const [unit, setUnit] = useState<string>("Marla");
  const [showMore, setShowMore] = useState<boolean>(false);
  const [coveredArea, setCoveredArea] = useState<string>("");
  const [constructionType, setConstructionType] = useState<string>("Grey Structure");
  const [constructionMode, setConstructionMode] = useState<string>("Without Material");
  const [error, setError] = useState<string>("");
  const [fadeIn, setFadeIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(t);
  }, []);

  type Range = { min: number; max: number; message: string };

  const ranges: Record<string, Range> = {
    Marla: { min: 2, max: 1999, message: "Valid range is 2 Marla - 1999 Marla" },
    Kanal: { min: 0.15, max: 99.95, message: "Valid range is 0.15 Kanal - 99.95 Kanal" },
    Sqft: { min: 675, max: 449775, message: "Valid range is 675 Sqft - 449775 Sqft" },
    Sqyard: { min: 75, max: 49975, message: "Valid range is 75 Sqyd - 49975 Sqyd" },
    Sqmeter: { min: 63, max: 41979, message: "Valid range is 63 Sqm - 41979 Sqm" },
    Acre: { min: 0.02, max: 12.49, message: "Valid range is 0.02 Acre - 12.49 Acre" },
  };

  const handleCalculate = useCallback(() => {
    const trimmed = area?.toString().trim();
    const value = parseFloat(trimmed ?? "");
    if (!isFinite(value) || trimmed === "") {
      setError("Please enter a valid area size");
      return;
    }
    if (value <= 0) {
      setError("Area must be greater than zero");
      return;
    }

    const range = ranges[unit];
    if (!range) {
      setError("Please select a valid unit");
      return;
    }

    if (value < range.min || value > range.max) {
      setError(range.message);
      return;
    }

    setError("");

    // Build query params so the result page is shareable via URL
    const params = new URLSearchParams({
      city,
      area: String(value),
      unit,
      type: constructionType,
      mode: constructionMode,
    });
    if (coveredArea) params.set("coveredArea", coveredArea);

    navigate(`/estimator/final-construction-cost?${params.toString()}`);
  }, [area, unit, ranges, navigate, city, coveredArea, constructionType, constructionMode]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />

      <main
        className={`flex-grow flex flex-col items-center justify-center py-13 w-full transition-opacity duration-700 ease-in-out ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
      >
        <div className="w-full bg-teal-950/10 text-center mb-10 pt-4 pb-20 px-3">
          <div className="w-full max-w-5xl mb-8">
            <nav className="text-xs text-gray-600" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1">
                <li>
                  <a href="/" className="hover:text-emerald-600 cursor-pointer">
                    Home
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-800 font-medium">Construction Cost Calculator</li>
              </ol>
            </nav>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 px-2">
            Construction Cost Calculator
          </h1>
          <p className="text-gray-600 text-sm sm:text-md max-w-2xl mx-auto px-2">
            Use our Construction Cost Calculator to get a quick estimate of building materials and costs for your project.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl -mt-20 p-6 w-full max-w-4xl">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
            {/* City */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="city" className="text-gray-700 font-medium mb-1 text-sm flex items-center gap-1">
                City
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border text-sm border-gray-300 cursor-pointer rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Islamabad">Islamabad</option>
                <option value="Rawalpindi">Rawalpindi</option>
              </select>
            </div>

            {/* Area Size */}
            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="area" className="text-gray-700 text-sm font-medium mb-1 flex items-center gap-1">
                Area Size
              </label>
              <input
                id="area"
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                placeholder="Enter Area Size"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="border border-gray-300 text-sm rounded-lg p-1 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                aria-describedby={error ? "area-error" : undefined}
              />
              {error && (
                <p id="area-error" className="text-red-500 text-xs mt-1" role="alert" aria-live="polite">
                  {error}
                </p>
              )}
            </div>

            {/* Unit */}
            <div className="flex flex-col w-full md:w-1/4">
              <label htmlFor="unit" className="text-gray-700 font-medium mb-1 text-sm flex items-center gap-1">
                Unit
              </label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="border border-gray-300 rounded-lg p-1 focus:ring-2 cursor-pointer text-sm focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Marla">Marla</option>
                <option value="Kanal">Kanal</option>
                <option value="Sqft">Square Feet</option>
                <option value="Sqyard">Square Yard</option>
                <option value="Sqmeter">Square Meter</option>
                <option value="Acre">Acre</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center w-full md:w-1/4">
              <button
                onClick={handleCalculate}
                className="bg-teal-800 hover:bg-teal-900 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg w-full"
                type="button"
              >
                Calculate Cost
              </button>
              <button
                onClick={() => setShowMore((s) => !s)}
                className="text-teal-700 text-sm mt-2 hover:underline cursor-pointer"
                type="button"
                aria-expanded={showMore}
              >
                {showMore ? "Less Options ▲" : "More Options ▼"}
              </button>
            </div>
          </div>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showMore ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
            }`}
          >
            <div className="grid md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
              {/* Covered Area */}
              <div className="flex flex-col">
                <label htmlFor="coveredArea" className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm">
                  Covered Area
                  <TooltipIcon text="Enter total constructed (covered) area in square feet." />
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg p-1 text-sm">
                  <input
                    id="coveredArea"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    placeholder="Enter Covered Area"
                    value={coveredArea}
                    onChange={(e) => setCoveredArea(e.target.value)}
                    className="flex-1 focus:outline-none"
                    aria-label="Covered area in square feet"
                  />
                  <span className="text-gray-500 text-sm ml-2">Sq. ft.</span>
                </div>
              </div>

              {/* Construction Type */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1 flex items-center gap-1 text-sm">
                  Construction Type
                  <TooltipIcon text="Grey Structure: foundation, walls, roof, plaster. Complete: includes finishing like paint, tiles, fixtures." />
                </label>
                <div className="flex gap-3">
                  {["Grey Structure", "Complete"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setConstructionType(type)}
                      className={`px-4 py-1 rounded-full border cursor-pointer text-sm ${
                        constructionType === type
                          ? "bg-green-50 border-green-500 text-emerald-700 font-medium"
                          : "border-gray-300 text-gray-700"
                      }`}
                      type="button"
                      aria-pressed={constructionType === type}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Construction Mode */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-700 font-medium text-sm mb-1 flex items-center gap-1">
                  Construction Mode
                  <TooltipIcon text="With Material: Builder provides materials. Without Material: You provide materials yourself." />
                </label>
                <div className="flex gap-3">
                  {["With Material", "Without Material"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setConstructionMode(mode)}
                      className={`px-4 py-1 rounded-full border cursor-pointer text-sm ${
                        constructionMode === mode
                          ? "bg-green-50 border-green-500 text-emerald-700 font-medium"
                          : "border-gray-300 text-gray-700"
                      }`}
                      type="button"
                      aria-pressed={constructionMode === mode}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PopularCalculations />
      <Instructions />
      <Footer />
    </div>
  );
};

export default ConstructionCostEstimator;
