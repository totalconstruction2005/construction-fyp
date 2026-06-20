import React from "react";

type EmployeeSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

const EmployeeSearch: React.FC<EmployeeSearchProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
};

export default EmployeeSearch;
