import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@features/auth";
import type { Project, ProjectStatus } from "@features/admin";
import { STORAGE_KEYS } from "@features/admin";

const statusColor = (status: ProjectStatus): string => {
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

const ClientProjects: React.FC = () => {
  const { user } = useAuth();
  const [approvedProjects, setApprovedProjects] = useState<Project[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.APPROVED_PROJECTS);
      const parsed: Project[] = raw ? JSON.parse(raw) : [];
      setApprovedProjects(parsed);
    } catch {
      setApprovedProjects([]);
    }
  }, []);

  const myProjects = useMemo(() => {
    if (!user) return [] as Project[];
    return approvedProjects.filter(
      (p) => p.clientEmail?.toLowerCase() === user.email.toLowerCase()
    );
  }, [approvedProjects, user]);

  return (
    <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <header className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Client Area</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">Projects</h1>
        <p className="text-gray-600 mt-2">View your approved projects and open updates.</p>
      </header>

        {myProjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900">No Projects Found</h2>
            <p className="text-gray-600 mt-2">You have not booked any projects yet.</p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/book-project"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
              >
                Book a Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProjects.map((p) => (
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

                <div className="mt-6">
                  <Link
                    to={`/projects/${p.id}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition"
                  >
                    View Project Updates
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
};

export default ClientProjects;
