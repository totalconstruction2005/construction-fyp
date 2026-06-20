import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth";
import { MyNavbar, Footer } from "@layouts";
import { apiClient } from "@shared/api/apiClient";

type FormData = {
  clientName: string;
  projectTitle: string;
  phone1: string;
  phone2?: string;
  email: string;
  siteLocation: string;
  plotNumber?: string;
  plotSize?: string;
  mapFile?: File;
};

const ContractorRequestForm: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  const [form, setForm] = useState<FormData>({
    clientName: "",
    projectTitle: "",
    phone1: "",
    phone2: "",
    email: user?.email || "",
    siteLocation: "",
    plotNumber: "",
    plotSize: "",
  });

  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // While auth state is loading, wait
    if (isLoading) return;

    // If not authenticated, redirect to login with return path
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { returnTo: location.pathname + location.search + location.hash }
      });
    }
  }, [isLoading, isAuthenticated, navigate, location]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, mapFile: file }));
      setFileName(file.name);
    }
  };

  const validateForm = (): boolean => {
    if (!form.clientName.trim()) {
      setError("Client Full Name is required");
      return false;
    }
    if (!form.projectTitle.trim()) {
      setError("Project Title is required");
      return false;
    }
    if (!form.phone1.trim()) {
      setError("Phone Number 1 is required");
      return false;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!form.siteLocation.trim()) {
      setError("Site Location / Address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!planId) {
        setError("Invalid plan. Please choose a contractor plan.");
        return;
      }

      const formData = new FormData();
      formData.append("planId", planId);
      formData.append("clientName", form.clientName.trim());
      formData.append("projectTitle", form.projectTitle.trim());
      formData.append("phone1", form.phone1.trim());
      formData.append("phone2", form.phone2?.trim() || "");
      formData.append("email", form.email.trim());
      formData.append("siteLocation", form.siteLocation.trim());
      formData.append("plotNumber", form.plotNumber?.trim() || "");
      formData.append("plotSize", form.plotSize?.trim() || "");

      if (form.mapFile) {
        formData.append("mapFile", form.mapFile);
      }

      await apiClient.post("/api/contractor-requests", formData);
      navigate(`/hire/${planId}/success`, { replace: true });
    } catch (err: any) {
      console.error(err);
      const message = err?.message || (err instanceof Error ? err.message : "Failed to submit request. Please try again.");
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-emerald-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-emerald-50 flex flex-col pt-10">
      <MyNavbar transparent={false} />

      <main className="flex-grow max-w-2xl w-full mx-auto px-4 py-12">
        <header className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
            Step 1 of 2
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Project Request Form
          </h1>
          <p className="text-gray-600 mt-2">
            Tell us about your project so we can find the right contractor.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Full Name */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="clientName"
              >
                Client Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="clientName"
                name="clientName"
                type="text"
                value={form.clientName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                placeholder="e.g., Ahmed Hassan"
                required
              />
            </div>

            {/* Project Title */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="projectTitle"
              >
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                id="projectTitle"
                name="projectTitle"
                type="text"
                value={form.projectTitle}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                placeholder="e.g., Residential Complex Renovation"
                required
              />
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-2"
                  htmlFor="phone1"
                >
                  Phone Number 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone1"
                  name="phone1"
                  type="tel"
                  value={form.phone1}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                  placeholder="+92-300-1234567"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-2"
                  htmlFor="phone2"
                >
                  Phone Number 2 (Optional)
                </label>
                <input
                  id="phone2"
                  name="phone2"
                  type="tel"
                  value={form.phone2}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                  placeholder="+92-321-7654321"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="email"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                placeholder="ahmed@example.com"
                required
              />
            </div>

            {/* Site Location */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="siteLocation"
              >
                Site Location / Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="siteLocation"
                name="siteLocation"
                value={form.siteLocation}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                placeholder="e.g., Gulberg, Lahore"
                required
              />
            </div>

            {/* Plot Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-2"
                  htmlFor="plotNumber"
                >
                  Plot Number 
                </label>
                <input
                  id="plotNumber"
                  name="plotNumber"
                  type="text"
                  value={form.plotNumber}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                  placeholder="e.g., A-456"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-semibold text-gray-700 mb-2"
                  htmlFor="plotSize"
                >
                  Plot Size
                </label>
                <input
                  id="plotSize"
                  name="plotSize"
                  type="text"
                  value={form.plotSize}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none placeholder:text-gray-400"
                  placeholder="e.g., 50,000 sq ft"
                />
              </div>
            </div>

            {/* Map Image / Document Upload */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-2"
                htmlFor="mapFile"
              >
                Map Image or Document (Optional)
              </label>
              <div className="relative">
                <input
                  id="mapFile"
                  name="mapFile"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  <svg
                    className="mx-auto h-8 w-8 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-6l6 6m0 0l-6 6m6-6H8"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {fileName ? (
                      <span className="font-semibold text-emerald-700">{fileName}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-emerald-700">Click to upload</span>
                        {" "}or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images, PDF, DOC up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg text-sm transition"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/construct-your-house")}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContractorRequestForm;
