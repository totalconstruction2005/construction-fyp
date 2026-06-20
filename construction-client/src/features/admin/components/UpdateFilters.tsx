import React from "react";

export type DateFilter = "today" | "7" | "30" | "all";
export type SortOrder = "newest" | "oldest";

interface UpdateFiltersProps {
  search: string;
  dateFilter: DateFilter;
  sortOrder: SortOrder;
  onSearch: (q: string) => void;
  onDateFilter: (f: DateFilter) => void;
  onSortOrder: (s: SortOrder) => void;
}

const UpdateFilters: React.FC<UpdateFiltersProps> = ({ search, dateFilter, sortOrder, onSearch, onDateFilter, onSortOrder }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Search</label>
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search title or description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        {/* Date Filter */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Date</label>
          <select
            value={dateFilter}
            onChange={(e) => onDateFilter(e.target.value as DateFilter)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="today">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="all">All</option>
          </select>
        </div>
        {/* Sort Order */}
        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1 block">Sort</label>
          <select
            value={sortOrder}
            onChange={(e) => onSortOrder(e.target.value as SortOrder)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UpdateFilters;
