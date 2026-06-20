import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorAlert from "@shared/components/ErrorAlert";
import { getUserFriendlyMessage } from "@shared/utils/errorHandler";
import { getAllMapRequests, updateMapRequestStatus } from "@shared/api/mapRequestService";

type MapRequestStatus = "Pending" | "Contacted" | "In Progress" | "Completed";

type MapRequest = {
  _id: string;
  contact?: {
    name?: string;
    phone?: string;
    city?: string;
  };
  plot?: {
    size?: number;
    unit?: "Marla" | "Sqft" | "Kanal" | string;
  };
  layout?: {
    bedrooms?: number;
  };
  status?: MapRequestStatus;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  } | null;
};

const getStatusStyles = (status: MapRequestStatus) => {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "Contacted":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-purple-100 text-purple-700";
  }
};

const MapRequests: React.FC = () => {
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<MapRequestStatus | "All">("All");
  const [requests, setRequests] = useState<MapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getAllMapRequests<MapRequest[]>();
        if (isMounted) {
          setRequests(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(getUserFriendlyMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          requests
            .map((request) => request.contact?.city)
            .filter((city): city is string => Boolean(city))
        )
      ).sort(),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const nameQuery = nameFilter.trim().toLowerCase();
    const cityQuery = cityFilter.trim().toLowerCase();

    return requests.filter((request) => {
      const nameValue = request.contact?.name || "";
      const cityValue = request.contact?.city || "";
      const matchesName = nameQuery
        ? nameValue.toLowerCase().includes(nameQuery)
        : true;
      const matchesCity = cityQuery
        ? cityValue.toLowerCase().includes(cityQuery)
        : true;
      const matchesStatus = statusFilter === "All" ? true : request.status === statusFilter;

      return matchesName && matchesCity && matchesStatus;
    });
  }, [nameFilter, cityFilter, statusFilter, requests]);

  const handleStatusChange = async (requestId: string, status: MapRequestStatus) => {
    setUpdatingId(requestId);
    setError(null);

    try {
      await updateMapRequestStatus(requestId, status);
      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId ? { ...request, status } : request
        )
      );
      setSuccessMessage("Status updated successfully");
    } catch (err) {
      setError(getUserFriendlyMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              Requests
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Map Requests</h1>
            <p className="text-sm text-gray-600">
              Review custom map design requests and update their status.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={nameFilter}
              onChange={(event) => setNameFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search by name"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              City
            </label>
            <input
              type="text"
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search by city"
              list="map-requests-city"
            />
            <datalist id="map-requests-city">
              {cities.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as MapRequestStatus | "All")}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onClose={() => setError(null)} />
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-600">
          Loading map requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-sm text-gray-600">
          No map requests match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRequests.map((request) => (
            <button
              key={request._id}
              type="button"
              onClick={() => navigate(`/admin/map-requests/${request._id}`)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {request.contact?.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500">{request.contact?.phone || "-"}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(
                      request.status || "Pending"
                    )}`}
                  >
                    {request.status || "Pending"}
                  </span>
                  <select
                    value={request.status || "Pending"}
                    disabled={updatingId === request._id}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      event.stopPropagation();
                      handleStatusChange(request._id, event.target.value as MapRequestStatus);
                    }}
                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 disabled:opacity-60"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {updatingId === request._id && (
                    <span className="text-[10px] text-gray-400">Updating...</span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                  <p className="font-medium">{request.contact?.city || "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Plot</p>
                  <p className="font-medium">
                    {request.plot?.size ?? "-"} {request.plot?.unit || ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Bedrooms</p>
                  <p className="font-medium">{request.layout?.bedrooms ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Submitted</p>
                  <p className="font-medium">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default MapRequests;
