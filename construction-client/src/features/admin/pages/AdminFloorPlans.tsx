import { useState, useRef, useEffect } from "react";
import type { FloorPlan, FloorPlanFormData } from "../types/floorPlan.types";
import FloorPlanCard from "../components/FloorPlanCard";
import FloorPlanFormModal from "../components/FloorPlanFormModal";
import * as floorPlanApi from "../api/floorPlan.api";
import ErrorAlert from "@shared/components/ErrorAlert";
import { useErrorHandler } from "@shared/hooks/useErrorHandler";

const AdminFloorPlans = () => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(null);
  const [selectedMarla, setSelectedMarla] = useState<number | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const { error, errorMessage, handleError, clearError } = useErrorHandler();

  // Get unique marla sizes from floor plans
  const marlaOptions = Array.from(new Set(floorPlans.map(fp => fp.marlaSize))).sort((a, b) => a - b);

  // Filter marla options based on search query
  const filteredMarlaOptions = marlaOptions.filter(marla => 
    marla.toString().includes(searchQuery)
  );

  // Filter floor plans by marla size and status
  const filteredFloorPlans = floorPlans.filter(fp => {
    // Filter by marla size
    const marlaMatch = selectedMarla === "all" || fp.marlaSize === selectedMarla;
    
    // Filter by status
    const statusMatch = selectedStatus === "all" || 
      (selectedStatus === "active" && fp.isActive) ||
      (selectedStatus === "inactive" && !fp.isActive);
    
    return marlaMatch && statusMatch;
  });

  // Fetch floor plans on mount
  useEffect(() => {
    fetchFloorPlans();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFloorPlans = async () => {
    try {
      setIsLoading(true);
      clearError();
      const data = await floorPlanApi.getAllAdminFloorPlans();
      setFloorPlans(data);
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarlaSelect = (marla: number | "all") => {
    setSelectedMarla(marla);
    setIsDropdownOpen(false);
    setSearchQuery("");
  };

  const handleStatusSelect = (status: "all" | "active" | "inactive") => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  const getSelectedStatusLabel = () => {
    switch (selectedStatus) {
      case "all":
        return "All Status";
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      default:
        return "All Status";
    }
  };

  const getSelectedMarlaLabel = () => {
    if (selectedMarla === "all") return "All Sizes";
    return `${selectedMarla} Marla`;
  };

  const handleAddFloorPlan = async (formData: FloorPlanFormData) => {
    try {
      setIsSaving(true);
      clearError();

      // Build FormData for API
      const data = new FormData();
      data.append("title", formData.title);
      data.append("marlaSize", formData.marlaSize.toString());
      data.append("category", formData.category);
      data.append("rooms", formData.rooms.toString());
      data.append("washrooms", formData.washrooms.toString());
      data.append("isActive", formData.isActive.toString());
      
      if (formData.imageFile) {
        data.append("image", formData.imageFile);
      }

      if (editingFloorPlan) {
        // Update existing floor plan
        await floorPlanApi.updateFloorPlan(editingFloorPlan._id, data);
      } else {
        // Create new floor plan
        await floorPlanApi.createFloorPlan(data);
      }

      // Refetch list
      await fetchFloorPlans();
      setIsModalOpen(false);
      setEditingFloorPlan(null);
    } catch (err) {
      handleError(err);
      throw err; // Re-throw to show error in modal
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (id: string) => {
    const floorPlan = floorPlans.find((fp) => fp._id === id);
    if (floorPlan) {
      setEditingFloorPlan(floorPlan);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) {
      return;
    }

    try {
      clearError();
      await floorPlanApi.deleteFloorPlan(id);
      setFloorPlans((prev) => prev.filter((fp) => fp._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  const handleToggleActive = async (id: string) => {
    const floorPlan = floorPlans.find((fp) => fp._id === id);
    if (!floorPlan) return;

    try {
      clearError();
      const data = new FormData();
      data.append("isActive", (!floorPlan.isActive).toString());
      
      await floorPlanApi.updateFloorPlan(id, data);
      
      // Update local state
      setFloorPlans((prev) =>
        prev.map((fp) =>
          fp._id === id ? { ...fp, isActive: !fp.isActive } : fp
        )
      );
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <>
      {/* Error Alert */}
      {error && errorMessage && (
        <div className="mb-6">
          <ErrorAlert message={errorMessage} onClose={clearError} />
        </div>
      )}

      {/* Header */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 relative z-40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Design Library</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Floor Plans</h1>
            <p className="text-sm text-gray-600 mt-2">Manage residential and commercial floor plan templates.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">
              {filteredFloorPlans.length} {filteredFloorPlans.length === 1 ? "Plan" : "Plans"}
            </span>
            <button
              onClick={() => {
                setEditingFloorPlan(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Floor Plan
            </button>
          </div>
        </div>

        {/* Filters Container */}
        <div className="mt-6 flex flex-row gap-4 sm:gap-6">
          {/* Marla Size Filter - Searchable Dropdown */}
          <div className="relative flex-1" ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Marla Size
            </label>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <span>{getSelectedMarlaLabel()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search marla size..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                {/* Options List */}
                <div className="max-h-60 overflow-y-auto">
                  {/* All Sizes Option */}
                  <button
                    onClick={() => handleMarlaSelect("all")}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
                      selectedMarla === "all" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Sizes</span>
                      {selectedMarla === "all" && (
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Marla Options */}
                  {filteredMarlaOptions.length > 0 ? (
                    filteredMarlaOptions.map((marla) => (
                      <button
                        key={marla}
                        onClick={() => handleMarlaSelect(marla)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
                          selectedMarla === marla ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{marla} Marla</span>
                          {selectedMarla === marla && (
                            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No matching sizes found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative flex-1" ref={statusDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Status
            </label>
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-between"
            >
              <span>{getSelectedStatusLabel()}</span>
              <svg
                className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isStatusDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {/* Options List */}
                <div className="max-h-60 overflow-y-auto">
                  {/* All Status Option */}
                  <button
                    onClick={() => handleStatusSelect("all")}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
                      selectedStatus === "all" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>All Status</span>
                      {selectedStatus === "all" && (
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Active Option */}
                  <button
                    onClick={() => handleStatusSelect("active")}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
                      selectedStatus === "active" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Active</span>
                      {selectedStatus === "active" && (
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Inactive Option */}
                  <button
                    onClick={() => handleStatusSelect("inactive")}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 transition ${
                      selectedStatus === "inactive" ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Inactive</span>
                      {selectedStatus === "inactive" && (
                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-gray-600">Loading floor plans...</p>
        </div>
      ) : filteredFloorPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFloorPlans.map((floorPlan) => (
            <FloorPlanCard
              key={floorPlan._id}
              floorPlan={floorPlan}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <svg
            className="w-20 h-20 mx-auto text-emerald-200 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {floorPlans.length === 0 ? "No Floor Plans Yet" : "No Matching Floor Plans"}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {floorPlans.length === 0 
              ? "Get started by adding your first floor plan template"
              : "No floor plans found matching your filters. Try adjusting the marla size or status filter."
            }
          </p>
          <button
            onClick={() => {
              setEditingFloorPlan(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
          >
            Add Floor Plan
          </button>
        </div>
      )}

      {/* Add/Edit Floor Plan Modal */}
      <FloorPlanFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFloorPlan(null);
        }}
        onSubmit={handleAddFloorPlan}
        editingFloorPlan={editingFloorPlan}
        isSaving={isSaving}
      />
    </>
  );
};

export default AdminFloorPlans;
