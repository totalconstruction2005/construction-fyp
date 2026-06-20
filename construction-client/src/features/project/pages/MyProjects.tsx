import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@features/auth";
import type { Project, ProjectStatus } from "@features/admin";
import { getMyContractorRequests } from "@shared/api/contractorRequestService";
import ErrorAlert from "@shared/components/ErrorAlert";

const statusColor = (status: ProjectStatus): string => {
  switch (status) {
    case "PendingApproval":
      return "bg-amber-100 text-amber-700";
    case "Contacted":
      return "bg-blue-100 text-blue-700";
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

const MyProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Helper: Map backend status to frontend status
  const mapStatusToFrontend = (backendStatus: string): ProjectStatus => {
    const statusMap: Record<string, ProjectStatus> = {
      Pending: "PendingApproval",
      Contacted: "Contacted",
      Approved: "Approved",
      "In Progress": "In Progress",
      Completed: "Completed",
      Rejected: "Rejected",
    };
    return (statusMap[backendStatus] || "PendingApproval") as ProjectStatus;
  };

  // Helper: Map backend contractor request to frontend Project type
  const mapRequestToProject = (req: any): Project => {
    return {
      id: req._id,
      name: req.projectTitle,
      client: user?.name || user?.email || "Unknown",
      clientPhone1: req.clientPhone1 || "",
      clientPhone2: req.clientPhone2,
      clientEmail: user?.email || "",
      contractType: req.planSnapshot?.title?.toLowerCase() || "basic",
      siteLocation: req.site?.address || "Unknown",
      mapImage: req.mapFile?.secure_url || "",
      plotNumber: req.site?.plotNumber || "",
      plotSize: req.site?.plotSize || "",
      status: mapStatusToFrontend(req.status),
    };
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyContractorRequests();
        const mappedProjects = data.map(mapRequestToProject);
        setProjects(mappedProjects);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err?.message || "Failed to load your projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const filterOptions = [
    { label: "All", value: "All" },
    { label: "Pending", value: "PendingApproval" },
    { label: "Contacted", value: "Contacted" },
    { label: "Approved", value: "Approved" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Rejected", value: "Rejected" },
  ];

  const filteredProjects = useMemo(() => {
    if (activeFilter === "All") return projects;
    return projects.filter((p) => p.status === activeFilter);
  }, [projects, activeFilter]);

  const previewOnlyStatuses = new Set(["PendingApproval", "Contacted", "Rejected"]);

  return (
    <>
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Your Projects</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Progress Tracking</h1>
          <p className="text-gray-600 mt-2">View the projects associated with your account.</p>
        </header>

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading your projects...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    activeFilter === option.value
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-emerald-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                <h2 className="text-xl font-bold text-gray-900">No Projects Found</h2>
                <p className="text-gray-600 mt-2">
                  {projects.length === 0
                    ? "You have not booked any projects yet."
                    : `No projects match the "${activeFilter}" filter.`}
                </p>
                {projects.length === 0 && (
                  <div className="mt-6 flex justify-center">
                    <a
                      href="/book-project"
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
                    >
                      Start Your Project
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  {activeFilter === "All" ? "All Projects" : `${activeFilter} Projects`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProjects.map((p) => {
                    if (previewOnlyStatuses.has(p.status)) {
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPreviewProject(p)}
                          className="text-left bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-gray-900 truncate">{p.name}</h3>
                              <p className="text-xs text-gray-600">Contract: {p.contractType.toUpperCase()}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(p.status)}`}>
                              {p.status === "PendingApproval" ? "Pending" : p.status}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-gray-700 line-clamp-2">{p.siteLocation} • {p.plotSize}</p>
                        </button>
                      );
                    }

                    return (
                      <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-600">Contract: {p.contractType.toUpperCase()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(p.status)}`}>
                            {p.status}
                          </span>
                        </div>

                        <div className="mt-4 text-sm text-gray-700 space-y-1">
                          <p><span className="font-semibold">Site:</span> {p.siteLocation}</p>
                          {p.plotNumber && <p><span className="font-semibold">Plot #:</span> {p.plotNumber}</p>}
                          {p.plotSize && <p><span className="font-semibold">Plot Size:</span> {p.plotSize}</p>}
                        </div>

                        {p.mapImage && (
                          <div className="mt-4">
                            <img src={p.mapImage} alt="Map preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                          </div>
                        )}

                        <div className="mt-6">
                          <Link
                            to={`/projects/${p.id}`}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
                          >
                            View Project Updates
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {previewProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setPreviewProject(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-lg w-[95%] max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">{previewProject.name}</h3>
              <button onClick={() => setPreviewProject(null)} className="text-gray-500 hover:text-gray-700" aria-label="Close">✕</button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(previewProject.status)}`}>
                  {previewProject.status === "PendingApproval" ? "Pending" : previewProject.status}
                </span>
                <span className="text-xs text-gray-600">Project status preview.</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-sm text-gray-800 space-y-1">
                  <p><span className="font-semibold">Contract:</span> {previewProject.contractType.toUpperCase()}</p>
                  <p><span className="font-semibold">Site:</span> {previewProject.siteLocation}</p>
                  {previewProject.plotNumber && <p><span className="font-semibold">Plot #:</span> {previewProject.plotNumber}</p>}
                  {previewProject.plotSize && <p><span className="font-semibold">Plot Size:</span> {previewProject.plotSize}</p>}
                </div>
                {previewProject.mapImage && (
                  <div>
                    <img src={previewProject.mapImage} alt="Map preview" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-2">We will keep you updated as this project moves forward.</p>
            </div>
            <div className="p-4 border-t text-right">
              <button onClick={() => setPreviewProject(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyProjects;
