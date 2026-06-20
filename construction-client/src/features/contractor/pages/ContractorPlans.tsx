
// src/pages/ContractorPlans.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { useAuth } from "@features/auth";
import { getContractorPlans } from "../../../shared/api/contractorPlanService";

type Plan = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  tagline: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
};

const ContractorPlans: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getContractorPlans();
        setPlans(data);
      } catch (err: any) {
        console.error("Error fetching contractor plans:", err);
        setError(err?.message || "Failed to load plans. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const onSelect = (planId: string) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: `/hire/${planId}` } });
    } else {
      navigate(`/hire/${planId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col">
        <MyNavbar transparent={false} />
        <div aria-hidden="true" className="h-6 sm:h-12" />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col">
        <MyNavbar transparent={false} />
        <div aria-hidden="true" className="h-6 sm:h-12" />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col">
      <MyNavbar transparent={false} />


      <div aria-hidden="true" className="h-6 sm:h-12" />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-emerald-900">Construct Your House</h1>
          <p className="mt-2 text-gray-600 max-w-2xl">
            Choose a plan that fits your project. After selecting a plan you'll fill a short request form.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-600">
              No plans available at the moment.
            </div>
          ) : (
            plans.map((p) => (
              <article key={p._id} className="bg-white rounded-2xl shadow p-6 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-xl font-semibold text-emerald-900">{p.title}</h2>
                  <div className="text-sm text-gray-500">{p.tagline}</div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-emerald-800">
                    {p.currency} {p.price.toLocaleString()}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-gray-700">
                    {p.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 inline-block w-2 h-2 rounded-full bg-emerald-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6">
                  <button
                    onClick={() => onSelect(p._id)}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 rounded-lg transition"
                    aria-label={`Select ${p.title} plan`}
                  >
                    Select
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        
      </main>

      <Footer />
    </div>
  );
};

export default ContractorPlans;
