import React from "react";
import type { Employee } from "../types";

type EmployeeTableProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onEdit, onDelete, isDeleting = false }) => {
  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700";
      case "On Leave":
        return "bg-amber-100 text-amber-700";
      case "Inactive":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (employees.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-12 bg-gray-50 rounded-lg">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="font-semibold mb-1">No employees found</p>
        <p className="text-xs">Add your first team member to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-gray-700 bg-gray-50 border-b">
            <th className="py-3 px-3 font-semibold">#</th>
            <th className="py-3 px-3 font-semibold">Name</th>
            <th className="py-3 px-3 font-semibold">Email</th>
            <th className="py-3 px-3 font-semibold">Role</th>
            <th className="py-3 px-3 font-semibold">Status</th>
            <th className="py-3 px-3 font-semibold">Phone</th>
            <th className="py-3 px-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={emp.id} className="border-b last:border-0 hover:bg-gray-50 transition">
              <td className="py-3 px-3 text-gray-500">{index + 1}</td>
              <td className="py-3 px-3 font-medium text-gray-900">{emp.name}</td>
              <td className="py-3 px-3 text-gray-700">{emp.email}</td>
              <td className="py-3 px-3 text-gray-700">{emp.role}</td>
              <td className="py-3 px-3">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(emp.status)}`}>
                  {emp.status}
                </span>
              </td>
              <td className="py-3 px-3 text-gray-700">{emp.phone || "—"}</td>
              <td className="py-3 px-3 text-right space-x-2">
                <button
                  onClick={() => onEdit(emp)}
                  disabled={isDeleting}
                  className="text-emerald-700 hover:text-emerald-900 disabled:text-emerald-300 disabled:cursor-not-allowed font-semibold text-sm transition"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(emp.id)}
                  disabled={isDeleting}
                  className="text-red-600 hover:text-red-900 disabled:text-red-300 disabled:cursor-not-allowed font-semibold text-sm transition"
                  type="button"
                >
                  {isDeleting ? "Removing..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
