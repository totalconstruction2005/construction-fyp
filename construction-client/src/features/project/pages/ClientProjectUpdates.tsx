import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClientUpdateTimeline from "@features/project/components/ClientUpdateTimeline";
import AttachmentViewer from "@features/admin/components/AttachmentViewer";
import UpdateFilters from "@features/admin/components/UpdateFilters";
import ErrorAlert from "@shared/components/ErrorAlert";
import type { DateFilter, SortOrder } from "@features/admin/components/UpdateFilters";
import type { Project, ProjectUpdate, Attachment } from "@features/admin";
import { getContractorRequestById } from "@shared/api/contractorRequestService";
import { getProjectUpdates, addProjectReply } from "@shared/api/projectUpdateService";

const ClientProjectUpdates: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewAttachment, setViewAttachment] = useState<Attachment | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  // Helper: Map backend status to frontend
  const mapStatusToFrontend = (backendStatus: string): string => {
    const statusMap: Record<string, string> = {
      Pending: "PendingApproval",
      Contacted: "Contacted",
      Approved: "Approved",
      "In Progress": "In Progress",
      Completed: "Completed",
      Rejected: "Rejected",
    };
    return statusMap[backendStatus] || "PendingApproval";
  };

  // Helper: Map backend request to frontend Project
  const mapRequestToProject = (req: any): Project => ({
    id: req._id,
    name: req.projectTitle,
    client: req.clientName || "Unknown",
    clientPhone1: req.clientPhone1 || "",
    clientPhone2: req.clientPhone2,
    clientEmail: req.clientEmail || "",
    contractType: req.planSnapshot?.title?.toLowerCase() || "basic",
    siteLocation: req.site?.address || "Unknown",
    mapImage: req.mapFile?.secure_url || "",
    plotNumber: req.site?.plotNumber || "",
    plotSize: req.site?.plotSize || "",
    status: mapStatusToFrontend(req.status) as any,
  });

  // Helper: Map backend update to frontend ProjectUpdate
  const mapUpdateToFrontend = (upd: any): ProjectUpdate => ({
    id: upd._id,
    projectId: upd.contractorRequest,
    title: upd.title,
    description: upd.description,
    attachments: (upd.attachments || []).map((att: any) => ({
      id: att.public_id,
      name: att.name,
      type: att.resource_type === "image" ? "image" : "file",
      data: att.secure_url,
      url: att.secure_url,
      uploadedAt: new Date().toISOString(),
    })),
    createdAt: upd.createdAt,
    createdBy: upd.createdBy,
    replies: (upd.replies || []).map((reply: any) => ({
      id: reply._id,
      projectId: upd.contractorRequest,
      updateId: upd._id,
      message: reply.message,
      createdAt: reply.createdAt,
      createdBy: reply.createdBy,
      parentReplyId: reply.parentReplyId,
    })),
  });

  // Load project and updates on mount
  useEffect(() => {
    if (!projectId) {
      navigate("/my-projects");
      return;
    }

    const fetchProjectData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch project details
        const projectData = await getContractorRequestById(projectId);
        const mappedProject = mapRequestToProject(projectData);
        setProject(mappedProject);

        // Fetch updates for this project
        const updatesData = await getProjectUpdates(projectId);
        const mappedUpdates = updatesData.map(mapUpdateToFrontend);
        setUpdates(mappedUpdates);
      } catch (err: any) {
        console.error("Error fetching project data:", err);
        // Check if it's a 403 (not their project)
        if (err?.statusCode === 403 || err?.response?.status === 403) {
          setError(err?.message || "You don't have access to this project.");
          setTimeout(() => navigate("/my-projects"), 2000);
        } else {
          setError(err?.message || "Failed to load project data. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, navigate]);

  const handleReply = async (updateId: string, message: string, parentReplyId?: string) => {
    if (!project) return;

    try {
      setError(null);
      // Call API to add reply
      await addProjectReply(updateId, message, parentReplyId);

      // Refresh updates
      const updatesData = await getProjectUpdates(project.id);
      const mappedUpdates = updatesData.map(mapUpdateToFrontend);
      setUpdates(mappedUpdates);
    } catch (err: any) {
      console.error("Error adding reply:", err);
      setError(err?.message || "Failed to add reply. Please try again.");
    }
  };

  const filteredSortedUpdates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();

    const withinDate = (createdAt: string) => {
      if (dateFilter === "all") return true;
      const created = new Date(createdAt);
      const diffMs = now.getTime() - created.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (dateFilter === "today") return diffDays < 1;
      if (dateFilter === "7") return diffDays <= 7;
      if (dateFilter === "30") return diffDays <= 30;
      return true;
    };

    const filtered = updates.filter((u) => {
      const matchesSearch = q
        ? (u.title?.toLowerCase().includes(q) || u.description.toLowerCase().includes(q))
        : true;
      const matchesDate = withinDate(u.createdAt);
      return matchesSearch && matchesDate;
    });

    const sorted = filtered.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return sorted;
  }, [updates, search, dateFilter, sortOrder]);

  if (isLoading) {
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-12">
          <p className="text-gray-600">Project not found</p>
        </div>
      </main>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />
        )}
        {/* Header / Project Summary */}
        <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
                Project Updates
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{project.name}</h1>
              <p className="text-sm text-gray-600 mt-2">Your Project</p>
            </div>
            <button
              onClick={() => navigate("/my-projects")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition w-full sm:w-auto"
            >
              ← Back to Projects
            </button>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-emerald-700 font-semibold">Status</p>
              <p className="text-md sm:text-lg font-bold text-emerald-900 mt-1">{project.status}</p>
            </div>

            <div className="bg-purple-100 border border-purple-300 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-purple-800 font-bold uppercase">Contract Type</p>
              <p className="text-md sm:text-lg font-bold text-purple-900 mt-1">
                {project.contractType?.toUpperCase() || "BASIC"}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-blue-700 font-semibold">📍 Site Location</p>
              <p className="text-sm font-bold text-blue-900 mt-1">{project.siteLocation}</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-purple-700 font-semibold">📏 Plot Size</p>
              <p className="text-sm font-bold text-purple-900 mt-1">{project.plotSize}</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-amber-700 font-semibold">🔢 Plot Number</p>
              <p className="text-sm font-bold text-amber-900 mt-1">{project.plotNumber}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Project History</h2>
          <p className="text-xs text-gray-600">Clients can reply to admin updates.</p>
        </div>

        {/* Filters */}
        <UpdateFilters
          search={search}
          dateFilter={dateFilter}
          sortOrder={sortOrder}
          onSearch={setSearch}
          onDateFilter={setDateFilter}
          onSortOrder={setSortOrder}
        />

        {/* Updates Timeline */}
        <div>
          <ClientUpdateTimeline
            updates={filteredSortedUpdates}
            isLoading={false}
            onOpenImage={(att) => {
              setViewAttachment(att);
              setViewerOpen(true);
            }}
            clientName={project.client}
            onReply={handleReply}
          />
        </div>

        {/* Viewer */}
        <AttachmentViewer
          open={viewerOpen}
          attachment={viewAttachment}
          onClose={() => {
            setViewerOpen(false);
            setViewAttachment(undefined);
          }}
        />
    </div>
  );
};

export default ClientProjectUpdates;
