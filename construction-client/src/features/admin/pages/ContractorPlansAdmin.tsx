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

        setError(
          err?.message || "Failed to load contractor plans."
        );

      } finally {

        setLoading(false);

      }

    };

    fetchPlans();

  }, []);

  const handleMoveUp = async (index: number) => {

    if (index === 0) return;

    const reordered = [...plans];

    [reordered[index], reordered[index - 1]] = [
      reordered[index - 1],
      reordered[index],
    ];

    setPlans(reordered);

    try {

      await reorderContractorPlans(
        reordered.map((p) => p._id)
      );

    } catch {

      setError("Failed to reorder plans.");

    }

  };

  const handleMoveDown = async (index: number) => {

    if (index === plans.length - 1) return;

    const reordered = [...plans];

    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];

    setPlans(reordered);

    try {

      await reorderContractorPlans(
        reordered.map((p) => p._id)
      );

    } catch {

      setError("Failed to reorder plans.");

    }

  };

  const handleDelete = async (id: string) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this plan?"
      )
    )
      return;

    try {

      await deleteContractorPlan(id);

      setPlans((prev) =>
        prev.filter((p) => p._id !== id)
      );

    } catch {

      setError("Failed to delete plan.");

    }

  };

  const handleEdit = (plan: ContractorPlan) => {

    navigate(
      "/admin/settings/contractor-plans/add",
      {
        state: {
          plan,
        },
      }
    );

  };

  const getThemeColor = (theme: string) => {

    switch (theme) {

      case "gold":
        return "bg-yellow-100 text-yellow-700";

      case "dark":
        return "bg-gray-800 text-white";

      case "gray":
        return "bg-gray-200 text-gray-700";

      default:
        return "bg-green-100 text-green-700";

    }

  };

  if (loading) {

    return (

      <div className="flex justify-center items-center h-64">

        Loading...

      </div>

    );

  }

    return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <p className="uppercase tracking-widest text-sm text-green-700 font-semibold">
              Settings
            </p>

            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              Contractor Plans
            </h1>

            <p className="text-gray-500 mt-2">
              Manage contractor pricing packages.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/admin/settings/contractor-plans/add")
            }
            className="px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold"
          >
            Add Contractor Plan
          </button>

        </div>

      </div>

      {error && (

        <div className="mb-5 bg-red-100 border border-red-300 rounded-lg p-4 text-red-700">

          {error}

        </div>

      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {plans.map((plan, index) => (

          <div
            key={plan._id}
            className="rounded-3xl bg-white shadow-lg border overflow-hidden"
          >

            <div
              className={`px-5 py-3 flex justify-between items-center ${getThemeColor(
                plan.theme
              )}`}
            >

              <span className="font-bold uppercase">

                {plan.badge || "Package"}

              </span>

              <span className="text-xs">

                #{index + 1}

              </span>

            </div>

            <div className="p-6">

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold">

                    {plan.title}

                  </h2>

                  <p className="text-gray-500 mt-1">

                    {plan.subtitle}

                  </p>

                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${
                    plan.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </span>

              </div>

              <div className="mt-6">

                <div className="flex items-end gap-1">

                  <span className="text-lg">

                    {plan.currency}

                  </span>

                  <span className="text-4xl font-bold">

                    {plan.price.toLocaleString()}

                  </span>

                </div>

                <p className="text-gray-500">

                  {plan.priceUnit}

                </p>

              </div>

              {plan.estimateText && (

                <p className="mt-4 italic text-sm text-gray-500">

                  {plan.estimateText}

                </p>

              )}

              {plan.description && (

                <p className="mt-5 text-gray-700 line-clamp-3">

                  {plan.description}

                </p>

              )}

              <div className="mt-6 space-y-3">

                <div className="flex justify-between">

                  <span className="font-medium">

                    Included Features

                  </span>

                  <span className="font-bold text-green-700">

                    {plan.includedFeatures?.length ?? 0}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="font-medium">

                    Excluded Features

                  </span>

                  <span className="font-bold text-red-600">

                    {plan.excludedFeatures?.length ?? 0}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="font-medium">

                    Timeline

                  </span>

                  <span>

                    {plan.timeline}

                  </span>

                </div>

              </div>

              <div className="mt-6">

                <p className="font-semibold">

                  Ideal For

                </p>

                <p className="text-gray-600 mt-1 line-clamp-2">

                  {plan.idealFor}

                </p>

              </div>

              <div className="grid grid-cols-2 gap-2 mt-8">

                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  ↑ Move Up
                </button>

                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === plans.length - 1}
                  className="py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-40"
                >
                  ↓ Move Down
                </button>

                <button
                  onClick={() => handleEdit(plan)}
                  className="py-2 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(plan._id)}
                  className="py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold"
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