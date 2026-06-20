import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient";
import ErrorAlert from "@shared/components/ErrorAlert";
import { ApiError } from "@shared/utils/errorHandler";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type DashboardStats = {
  pendingMapRequests: number;
  pendingContractorRequests: number;
  approvedProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  pendingAppointments: number;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getFriendlyErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.statusCode === 0) {
        return "Unable to connect to server.";
      }

      if (error.statusCode === 401) {
        return "Session expired. Please login again.";
      }

      if (error.statusCode === 403) {
        return "You are not authorized to view this dashboard.";
      }

      return error.message || "Unable to load dashboard data.";
    }

    return "Unable to load dashboard data.";
  };

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>("/api/dashboard/admin");
      setStats(response.data || null);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDashboard();
  }, [fetchDashboard]);

  return (
    <>
      {/* Header */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {errorMessage && (
          <ErrorAlert
            type="error"
            title="Dashboard Error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
            className="mb-4"
          />
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              Control Center
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Overview of employees, projects, and appointments.</p>
          </div>
          
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 shadow-sm animate-pulse"
              >
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
            {/* Total Employees Card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-emerald-700 font-semibold">Total Employees</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.totalEmployees}</p>
              <p className="text-[11px] text-emerald-600 mt-1">
                Active {stats.activeEmployees} • Leave {stats.onLeaveEmployees}
              </p>
            </div>

            {/* Approved Projects Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-blue-700 font-semibold">Approved Projects</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.approvedProjects}</p>
              <p className="text-[11px] text-blue-600 mt-1">Ready to start</p>
            </div>

            {/* In Progress Projects Card */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-purple-700 font-semibold">In Progress</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.inProgressProjects}</p>
              <p className="text-[11px] text-purple-600 mt-1">Currently in execution</p>
            </div>

            {/* Completed Projects Card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-emerald-700 font-semibold">Completed Projects</p>
              <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.completedProjects}</p>
              <p className="text-[11px] text-emerald-600 mt-1">Successfully delivered</p>
            </div>

            {/* Pending Map Requests Card */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 shadow-sm">
              <p className="text-xs text-amber-700 font-semibold">Pending Map Requests</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.pendingMapRequests}</p>
              <p className="text-[11px] text-amber-600 mt-1">Awaiting response</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8 mt-6">
            <p className="font-semibold">No data available</p>
            <p className="text-xs mt-1">Unable to load dashboard statistics</p>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Employees</h3>
          <p className="text-sm text-gray-600 mb-4">Add, edit, or remove team members.</p>
          <Link
            to="/admin/employees"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Go to Employees
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Review Map Requests</h3>
          <p className="text-sm text-gray-600 mb-4">
            {stats ? `${stats.pendingMapRequests} pending requests` : "View pending map requests"}.
          </p>
          <Link
            to="/admin/map-requests"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Go to Map Requests
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Review Projects</h3>
          <p className="text-sm text-gray-600 mb-4">
            {stats ? `${stats.approvedProjects + stats.inProgressProjects} active projects` : "View projects"}.
          </p>
          <Link
            to="/admin/projects"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md text-sm"
          >
            Go to Projects
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
