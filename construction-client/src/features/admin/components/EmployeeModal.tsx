import React, { useState, useEffect, useRef } from "react";
import type { Employee, EmployeeForm } from "../types";

type EmployeeModalProps = {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (data: EmployeeForm) => void;
  isLoading?: boolean;
};

const EmployeeModal: React.FC<EmployeeModalProps> = ({ open, employee, onClose, onSubmit, isLoading = false }) => {
  const emptyForm: EmployeeForm = { name: "", email: "", role: "", phone: "", status: "Active" };
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email,
        role: employee.role,
        phone: employee.phone ?? "",
        status: employee.status,
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [employee, open]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) {
      setError("Name, email, and role are required.");
      return;
    }

    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {employee ? "Edit Employee" : "Add Employee"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {employee ? "Update team member information" : "Add a new team member to your roster"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="modal-name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-name"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="modal-email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-email"
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="modal-role">
              Role / Title <span className="text-red-500">*</span>
            </label>
            <input
              id="modal-role"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g., Site Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="modal-phone">
              Phone (Optional)
            </label>
            <input
              id="modal-phone"
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g., +92-300-1234567"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="modal-status">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="modal-status"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Employee["status"] })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              {isLoading ? "Saving..." : employee ? "Save Changes" : "Add Employee"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 font-semibold hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
