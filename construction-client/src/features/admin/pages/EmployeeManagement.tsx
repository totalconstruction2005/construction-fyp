import React, { useCallback, useEffect, useMemo, useState } from "react";
import EmployeeModal from "../components/EmployeeModal";
import EmployeeSearch from "../components/EmployeeSearch";
import EmployeeTable from "../components/EmployeeTable";
import type { Employee, EmployeeForm } from "../types";
import { apiClient } from "@shared/api/apiClient";
import ErrorAlert from "@shared/components/ErrorAlert";
import { ApiError } from "@shared/utils/errorHandler";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type EmployeeApi = {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: Employee["status"];
};

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mapEmployee = (employee: EmployeeApi): Employee => ({
    id: employee._id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    phone: employee.phone,
    status: employee.status,
  });

  const getFriendlyErrorMessage = (error: unknown) => {
    if (error instanceof ApiError) {
      if (error.statusCode === 0) {
        return "Unable to connect to server.";
      }

      if (error.statusCode === 401 || error.statusCode === 403) {
        return "You are not authorized to perform this action.";
      }

      const message = error.message || "Request failed";
      if (error.statusCode === 400) {
        if (message.toLowerCase().includes("already exists")) {
          return "An employee with this email already exists.";
        }
        if (message.toLowerCase().includes("required")) {
          return message;
        }
        return "Invalid input. Please check your data and try again.";
      }

      if (error.statusCode === 404) {
        return "Employee not found. It may have been deleted.";
      }

      if (error.statusCode && error.statusCode >= 500) {
        return "Server error. Please try again later.";
      }

      return message;
    }

    return "Something went wrong. Please try again.";
  };

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.get<ApiResponse<EmployeeApi[]>>("/api/employees", {
        retries: 3,
      });
      const data = response.data || [];
      setEmployees(data.map(mapEmployee));
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      console.error("Failed to fetch employees:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const handleAddEmployee = () => {
    setErrorMessage(null);
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setErrorMessage(null);
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;

    if (!window.confirm(`Are you sure you want to delete "${employee.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await apiClient.delete<ApiResponse<null>>(`/api/employees/${id}`, {
        retries: 2,
      });
      await fetchEmployees();
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      console.error("Failed to delete employee:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalSubmit = async (formData: EmployeeForm) => {
    setIsSaving(true);
    setErrorMessage(null);

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role.trim(),
      phone: formData.phone?.trim() || undefined,
      status: formData.status,
    };

    try {
      if (editingEmployee) {
        await apiClient.patch<ApiResponse<EmployeeApi>>(`/api/employees/${editingEmployee.id}`, payload, {
          retries: 2,
        });
      } else {
        await apiClient.post<ApiResponse<EmployeeApi>>("/api/employees", payload, {
          retries: 2,
        });
      }

      await fetchEmployees();
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error));
      console.error("Failed to save employee:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleRetry = async () => {
    await fetchEmployees();
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Team Management</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Employee Roster</h1>
            <p className="text-sm text-gray-600 mt-2">Manage your team members and their information.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full">
              {employees.length} {employees.length === 1 ? "Member" : "Members"}
            </span>
            <button
              onClick={handleAddEmployee}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-lg text-sm transition shadow-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Employee List Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {errorMessage && (
          <ErrorAlert
            type="error"
            title="Employee action failed"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
            showDetails={true}
            details={errorMessage}
            className="mb-4"
          />
        )}

        {isLoading ? (
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-8 text-center" >
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
              <p className="text-gray-600 font-medium">Loading employees...</p>
            </div>
          </div>
        ) : employees.length === 0 && !errorMessage ? (
          <div className="text-center text-gray-500 text-sm py-12 bg-gray-50 rounded-lg">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="font-semibold mb-1">No employees found</p>
            <p className="text-xs">Add your first team member to get started</p>
          </div>
        ) : (
          <>
            <EmployeeSearch value={searchQuery} onChange={setSearchQuery} />

            <EmployeeTable
              employees={filteredEmployees}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
              isDeleting={isSaving}
            />

            {searchQuery && filteredEmployees.length === 0 && employees.length > 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                <p className="font-semibold">No results found</p>
                <p className="text-xs mt-1">Try adjusting your search query</p>
              </div>
            )}
          </>
        )}

        {errorMessage && !isLoading && (
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition"
            >
              Retry
            </button>
          </div>
        )}

        {searchQuery && filteredEmployees.length === 0 && employees.length > 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            <p className="font-semibold">No results found</p>
            <p className="text-xs mt-1">Try adjusting your search query</p>
          </div>
        )}
      </section>

      {/* Modal */}
      <EmployeeModal
        open={isModalOpen}
        employee={editingEmployee}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isLoading={isSaving}
      />
    </>
  );
};

export default EmployeeManagement;
