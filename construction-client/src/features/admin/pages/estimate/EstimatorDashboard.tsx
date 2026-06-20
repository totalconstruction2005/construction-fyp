import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorAlert from "@shared/components/ErrorAlert";
import { getEstimatorRegions } from "../../api/estimator.api";

type NavCard = {
  title: string;
  description: string;
  to: string;
 
};

const cards: NavCard[] = [
  {
    title: "Region Rates",
    description: "Add, edit and delete regions. Set cost-per-sqft rates for each combination.",
    to: "/admin/estimator/regions",
   
  },
  {
    title: "Breakdown Tree",
    description: "Build the full nested category breakdown structure with percentages for each region.",
    to: "/admin/estimator/breakdown",
    
  },
  {
    title: "Estimate Preview",
    description: "Run a live cost estimate using the current saved data and verify results.",
    to: "/admin/estimator/preview",
   
  },
];

const EstimatorDashboard: React.FC = () => {
  const [regionCount, setRegionCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEstimatorRegions();
        setRegionCount(data.length);
      } catch {
        setError("Failed to load estimator summary.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
          Admin
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">Estimator Dashboard</h1>
        <p className="text-sm text-gray-600 mt-2">
          Construction Cost Estimator Administration — manage regions, rates, and the cost breakdown tree.
        </p>

        {error && (
          <div className="mt-4">
            <ErrorAlert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Configured Regions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {loading ? "—" : (regionCount ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-emerald-300 hover:shadow-md transition group"
          >
            <h2 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition">
              {card.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{card.description}</p>
            <p className="mt-4 text-sm font-semibold text-emerald-600 group-hover:underline">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EstimatorDashboard;
