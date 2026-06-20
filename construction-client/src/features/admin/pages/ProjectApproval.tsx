import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Project, ProjectStatus } from "../types";
import {
  getAdminContractorRequests,
  updateContractorRequestStatus,
} from "@shared/api/contractorRequestService";
import { getContractorPlans } from "@shared/api/contractorPlanService";

const ProjectApproval: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [contractTypeFilter, setContractTypeFilter] = useState<string>("All");
  const [availableContractTypes, setAvailableContractTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map backend status to frontend status
  const mapStatusToFrontend = (backendStatus: string): ProjectStatus => {
    if (backendStatus === "Pending") return "PendingApproval";
    return backendStatus as ProjectStatus;
  };

  // Map frontend status to backend status
  const mapStatusToBackend = (frontendStatus: ProjectStatus): string => {
    if (frontendStatus === "PendingApproval") return "Pending";
    return frontendStatus;
  };

  // Map backend contractor request to frontend Project
  const mapRequestToProject = (request: any): Project => {
    return {
      id: request._id,
      name: request.projectTitle,
      client: request.clientName,
      clientPhone1: request.contact.phone1,
      clientPhone2: request.contact.phone2,
      clientEmail: request.contact.email,
      contractType: request.planSnapshot?.title?.toLowerCase() || "basic",
      siteLocation: request.site.address,
      mapImage: request.mapFile?.secure_url || "",
      plotNumber: request.site.plotNumber || "N/A",
      plotSize: request.site.plotSize || "N/A",
      status: mapStatusToFrontend(request.status),
    };
  };

  // Fetch requests from backend
  const fetchRequests = async (filterStatus?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert frontend filter to backend status
      let backendStatus: string | undefined;
      if (filterStatus && filterStatus !== "All") {
        backendStatus = mapStatusToBackend(filterStatus as ProjectStatus);
      }
      
      const data = await getAdminContractorRequests(backendStatus);
      const mappedProjects = data.map(mapRequestToProject);
      setProjects(mappedProjects);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load contractor requests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchRequests(activeFilter);
  }, [activeFilter]);

  // Fetch contractor plans to get available contract types
  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        const plans = await getContractorPlans();
        const types = plans.map((plan) => plan.title?.toLowerCase()).filter(Boolean);
        setAvailableContractTypes(types);
      } catch (err) {
        console.error("Failed to fetch contract types:", err);
      }
    };

    fetchContractTypes();
  }, []);

  // Filter projects by contract type
  const filteredProjects = useMemo(() => {
    if (contractTypeFilter === "All") return projects;
    return projects.filter((p) => p.contractType === contractTypeFilter);
  }, [projects, contractTypeFilter]);

  const stats = useMemo(() => {
    const pendingCount = filteredProjects.filter((p) => p.status === "PendingApproval").length;
    const contactedCount = filteredProjects.filter((p) => p.status === "Contacted").length;
    const approvedCount = filteredProjects.filter((p) => p.status === "Approved").length;
    const inProgressCount = filteredProjects.filter((p) => p.status === "In Progress").length;
    const completedCount = filteredProjects.filter((p) => p.status === "Completed").length;
    const rejectedCount = filteredProjects.filter((p) => p.status === "Rejected").length;
    const totalApproved = approvedCount + inProgressCount + completedCount;

    return {
      pendingCount,
      contactedCount,
      approvedCount,
      inProgressCount,
      completedCount,
      rejectedCount,
      totalApproved,
    };
  }, [filteredProjects]);

  // Update status handlers
  const handleApproveProject = async (projectId: string) => {
    try {
      await updateContractorRequestStatus(projectId, "Approved");
      fetchRequests(activeFilter);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to approve project");
    }
  };

  const handleRejectProject = async (projectId: string) => {
    try {
      await updateContractorRequestStatus(projectId, "Rejected");
      fetchRequests(activeFilter);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to reject project");
    }
  };

  const handleUpdateStatus = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      const backendStatus = mapStatusToBackend(newStatus);
      await updateContractorRequestStatus(projectId, backendStatus);
      fetchRequests(activeFilter);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update status");
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case "PendingApproval":
        return "bg-amber-100 text-amber-700";
      case "Contacted":
        return "bg-sky-100 text-sky-700";
      case "Approved":
        return "bg-emerald-100 text-emerald-700";
      case "In Progress":
        return "bg-purple-100 text-purple-700";
      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Management</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Project Approval & Status</h1>
          <p className="text-sm text-gray-600 mt-2">Review pending projects, approve them, and track status updates.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mt-6">
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-amber-700 font-semibold">Pending Approval</p>
            <p className="text-md sm:text-2xl font-bold text-amber-900 mt-1">{stats.pendingCount}</p>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-sky-700 font-semibold">Contacted</p>
            <p className="text-md sm:text-2xl font-bold text-sky-900 mt-1">{stats.contactedCount}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-emerald-700 font-semibold">Approved</p>
            <p className="text-md sm:text-2xl font-bold text-emerald-900 mt-1">{stats.approvedCount}</p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-purple-700 font-semibold">In Progress</p>
            <p className="text-md sm:text-2xl font-bold text-purple-900 mt-1">{stats.inProgressCount}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-emerald-700 font-semibold">Completed</p>
            <p className="text-md sm:text-2xl font-bold text-emerald-900 mt-1">{stats.completedCount}</p>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-red-700 font-semibold">Rejected</p>
            <p className="text-md sm:text-2xl font-bold text-red-900 mt-1">{stats.rejectedCount}</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-700 font-semibold">Total Approved</p>
            <p className="text-md sm:text-2xl font-bold text-gray-900 mt-1">{stats.totalApproved}</p>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Filter by Status</p>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="All">All Statuses</option>
          <option value="PendingApproval">Pending Approval</option>
          <option value="Contacted">Contacted</option>
          <option value="Approved">Approved</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Contract Type Filters */}
      {availableContractTypes.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-600 mb-2">Filter by Contract Type</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setContractTypeFilter("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                contractTypeFilter === "All"
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:border-purple-200"
              }`}
            >
              All Types
            </button>
            {availableContractTypes.map((type) => (
              <button
                key={type}
                onClick={() => setContractTypeFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                  contractTypeFilter === type
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-purple-200"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm font-medium">Loading contractor requests...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-gray-500 text-sm mb-2">No projects found for this filter.</p>
            <p className="text-gray-400 text-xs">Try another status filter to view projects.</p>
          </div>
        ) : (
          filteredProjects.map((proj) => {
            const showDecisionActions = proj.status === "PendingApproval" || proj.status === "Contacted";
            const showStatusSelect = proj.status === "Approved" || proj.status === "In Progress";
            const showViewUpdates = proj.status === "Approved" || proj.status === "In Progress" || proj.status === "Completed";

            return (
              <div key={proj.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(proj.status)}`}>
                        {proj.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        {proj.contractType?.toUpperCase() || "BASIC"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Client: {proj.client}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">📞 Phone 1:</span>
                        <span className="font-semibold text-gray-900 ml-1">{proj.clientPhone1}</span>
                      </div>
                      {proj.clientPhone2 && (
                        <div>
                          <span className="text-gray-600">📞 Phone 2:</span>
                          <span className="font-semibold text-gray-900 ml-1">{proj.clientPhone2}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">✉️ Email:</span>
                        <span className="font-semibold text-gray-900 ml-1">{proj.clientEmail}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Site Location: {proj.siteLocation}</p>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Plot Number:</span>
                        <span className="font-semibold text-gray-900 ml-1">{proj.plotNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Plot Size:</span>
                        <span className="font-semibold text-gray-900 ml-1">{proj.plotSize}</span>
                      </div>
                    </div>
                    {proj.mapImage && (
                      <div className="mt-4">
                        <img
                          src={proj.mapImage}
                          alt="Site Map"
                          className="w-full md:w-96 h-48 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {showDecisionActions && (
                      <div className="flex flex-wrap gap-2">
                        {proj.status === "PendingApproval" && (
                          <button
                            onClick={() => handleUpdateStatus(proj.id, "Contacted")}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md text-sm transition"
                          >
                            Mark as Contacted
                          </button>
                        )}
                        <button
                          onClick={() => handleApproveProject(proj.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md text-sm transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Reject project "${proj.name}"?`)) {
                              handleRejectProject(proj.id);
                            }
                          }}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-md text-sm transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {showStatusSelect && (
                      <div>
                        <label className="text-xs text-gray-600 font-semibold block mb-2">Update Status</label>
                        <select
                          value={proj.status}
                          onChange={(e) => handleUpdateStatus(proj.id, e.target.value as ProjectStatus)}
                          className="border border-gray-300 rounded-md p-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Approved">Approved</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    )}

                    {showViewUpdates && (
                      <button
                        onClick={() => navigate(`/admin/projects/${proj.id}/updates`)}
                        className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-md text-sm transition whitespace-nowrap"
                      >
                        📋 View Updates
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default ProjectApproval;
