import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UpdateTimeline from "../components/UpdateTimeline";
import AddUpdateModal from "../components/AddUpdateModal";
import AttachmentViewer from "../components/AttachmentViewer";
import UpdateFilters from "../components/UpdateFilters";
import type { DateFilter, SortOrder } from "../components/UpdateFilters";
import type { Attachment, Project, ProjectUpdate, ProjectStatus } from "../types";
import { getContractorRequestById, updateContractorRequestStatus } from "@shared/api/contractorRequestService";
import { getProjectUpdates, createProjectUpdate, addProjectReply, deleteProjectUpdate } from "@shared/api/projectUpdateService";

const ProjectUpdates: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Modal & viewer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewAttachment, setViewAttachment] = useState<Attachment | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

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

  // Map backend update to frontend update
  const mapUpdateToFrontend = (update: any): ProjectUpdate => {
    return {
      id: update._id,
      projectId: update.contractorRequest,
      title: update.title,
      description: update.description,
      attachments: (update.attachments || []).map((att: any) => ({
        id: att.public_id,
        name: att.name,
        type: att.resource_type === "image" ? "image" : "file",
        data: att.secure_url,
        url: att.secure_url,
        uploadedAt: new Date().toISOString(),
      })),
      createdAt: update.createdAt,
      createdBy: update.createdBy,
      replies: (update.replies || []).map((reply: any) => ({
        id: reply._id,
        projectId: update.contractorRequest,
        updateId: update._id,
        message: reply.message,
        createdAt: reply.createdAt,
        createdBy: reply.createdBy,
        parentReplyId: reply.parentReplyId,
      })),
    };
  };

  // Fetch project details and updates
  const fetchProjectData = async () => {
    if (!projectId) {
      navigate("/admin/projects");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch project details
      const projectData = await getContractorRequestById(projectId);
      const mappedProject = mapRequestToProject(projectData);
      setProject(mappedProject);

      // Fetch updates
      const updatesData = await getProjectUpdates(projectId);
      const mappedUpdates = updatesData.map(mapUpdateToFrontend);
      setUpdates(mappedUpdates);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load project data");
      if (err?.statusCode === 404) {
        setTimeout(() => navigate("/admin/projects"), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load project and updates on mount
  useEffect(() => {
    fetchProjectData();
  }, [projectId, navigate]);

  const handleSaveUpdate = async (
    updateData: Omit<ProjectUpdate, "createdAt" | "createdBy" | "replies"> & { id?: string }
  ) => {
    if (!projectId) return;

    try {
      setSubmitting(true);
      setError(null);

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append("title", updateData.title);
      formData.append("description", updateData.description);

      // Add attachments
      if (updateData.attachments && updateData.attachments.length > 0) {
        for (const attachment of updateData.attachments) {
          // If attachment has a data URL (base64), convert to blob
          if (attachment.data && attachment.data.startsWith("data:")) {
            const response = await fetch(attachment.data);
            const blob = await response.blob();
            const file = new File([blob], attachment.name, { type: blob.type });
            formData.append("attachments", file);
          }
        }
      }

      await createProjectUpdate(projectId, formData);
      await fetchProjectData(); // Refresh data

      setIsModalOpen(false);
      setEditingUpdate(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!projectId) return;
    const confirmation = window.confirm("Delete this update?");
    if (!confirmation) return;

    try {
      setSubmitting(true);
      await deleteProjectUpdate(updateId);
      await fetchProjectData(); // Refresh data
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete update");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (updateId: string, message: string, parentReplyId?: string) => {
    if (!projectId) return;

    try {
      await addProjectReply(updateId, message, parentReplyId);
      await fetchProjectData(); // Refresh data
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to add reply");
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project || !projectId) return;

    try {
      setSubmitting(true);
      setError(null);

      const backendStatus = mapStatusToBackend(newStatus);
      await updateContractorRequestStatus(projectId, backendStatus);

      // Refresh both project and updates (system update will be auto-created)
      await fetchProjectData();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to update status");
    } finally {
      setSubmitting(false);
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
        ? u.title.toLowerCase().includes(q) || u.description.toLowerCase().includes(q)
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
      <>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </>
    );
  }

  if (error && !project) {
    return (
      <>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-600">Project not found</p>
        </div>
      </>
    );
  }

  return (
    <>
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

      {/* Header / Project Summary */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              Project Updates
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{project.name}</h1>
            <p className="text-sm text-gray-600 mt-2">Client: {project.client}</p>
          </div>
          <button
            onClick={() => navigate("/admin/projects")}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition"
          >
            ← Back to Projects
          </button>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-emerald-700 font-semibold">Status</p>
            <p className="text-lg font-bold text-emerald-900 mt-1">{project.status}</p>
          </div>

          <div className="bg-purple-100 border border-purple-300 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-purple-800 font-bold uppercase">Contract Type</p>
            <p className="text-lg font-bold text-purple-900 mt-1">
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

        {/* Additional Client Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-700 font-semibold">📞 Primary Phone</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{project.clientPhone1}</p>
          </div>

          {project.clientPhone2 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-gray-700 font-semibold">📞 Secondary Phone</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{project.clientPhone2}</p>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-700 font-semibold">✉️ Email</p>
            <p className="text-sm font-bold text-gray-900 mt-1">{project.clientEmail}</p>
          </div>
        </div>

        {/* Status Update Control */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Update Project Status
          </label>
          <select
            value={project.status}
            onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
            disabled={submitting}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Project History</h2>
        <button
          onClick={() => {
            setEditingUpdate(null);
            setIsModalOpen(true);
          }}
          disabled={submitting}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Update
        </button>
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
        <UpdateTimeline
          updates={filteredSortedUpdates}
          isLoading={false}
          onOpenImage={(att) => {
            setViewAttachment(att);
            setViewerOpen(true);
          }}
          onReply={handleReply}
          onEditUpdate={(update) => {
            setEditingUpdate(update);
            setIsModalOpen(true);
          }}
          onDeleteUpdate={handleDeleteUpdate}
        />
      </div>

      {/* Modal & Viewer */}
      <AddUpdateModal
        open={isModalOpen}
        projectId={projectId!}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUpdate(null);
        }}
        onSubmit={handleSaveUpdate}
        initialUpdate={editingUpdate}
        mode={editingUpdate ? "edit" : "create"}
      />
      <AttachmentViewer
        open={viewerOpen}
        attachment={viewAttachment}
        onClose={() => {
          setViewerOpen(false);
          setViewAttachment(undefined);
        }}
      />
    </>
  );
};

export default ProjectUpdates;
