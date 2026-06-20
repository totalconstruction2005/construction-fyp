import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyNavbar, Footer } from "@layouts";
import { useAuth } from "@features/auth";
import ErrorAlert from "@shared/components/ErrorAlert";
import { getUserFriendlyMessage } from "@shared/utils/errorHandler";
import { getMyMapRequests } from "@shared/api/mapRequestService";

type RequestStatus = "Pending" | "Contacted" | "In Progress" | "Completed";

type UploadItem = {
  name?: string;
  type?: string;
  secure_url?: string;
  public_id?: string | null;
  url?: string;
};

type MapRequest = {
  _id: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
  };
  plot?: {
    size?: number;
    unit?: string;
    dimensions?: string;
    facing?: string;
    type?: string;
    cornerPlot?: "Yes" | "No" | "";
  };
  layout?: {
    bedrooms?: number;
    washrooms?: number;
    kitchens?: number;
    carPorch?: "Yes" | "No" | "";
    tvLounge?: "Yes" | "No" | "";
    drawingRoom?: "Yes" | "No" | "";
    storeRoom?: "Yes" | "No" | "";
    lawn?: "Yes" | "No" | "";
    terrace?: "Yes" | "No" | "";
  };
  notes?: string;
  uploads?: UploadItem[];
  status?: RequestStatus;
  createdAt?: string;
  sketch?: {
    secure_url?: string;
  } | null;
  sketchDataUrl?: string;
};

const getStatusStyles = (status: RequestStatus) => {
  switch (status) {
    case "Pending":
      return "bg-amber-100 text-amber-700";
    case "Contacted":
      return "bg-blue-100 text-blue-700";
    case "In Progress":
      return "bg-purple-100 text-purple-700";
    case "Completed":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const MyMapRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openId, setOpenId] = useState<string | null>(null);
  const [requests, setRequests] = useState<MapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getMyMapRequests<MapRequest[]>();

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
  }, [user]);

  const getUploadUrl = (upload: UploadItem) => upload.secure_url || upload.url || "";

  const isImageUpload = (upload: UploadItem) => {
    if (upload.type && upload.type.startsWith("image/")) return true;
    const url = getUploadUrl(upload).toLowerCase();
    return url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".webp");
  };

  const isPdfUpload = (upload: UploadItem) => {
    if (upload.type === "application/pdf") return true;
    const url = getUploadUrl(upload).toLowerCase();
    return url.endsWith(".pdf");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />
      <div className="h-16" aria-hidden />

      <main className="w-full flex-grow px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
                  Design Studio
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">My Map Requests</h1>
                <p className="text-sm text-gray-600">
                  Track your custom map design requests and their status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/design-studio/custom-design")}
                className="bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-md shadow hover:bg-emerald-800"
              >
                Request Custom Map
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorAlert message={error} onClose={() => setError(null)} />
            </div>
          )}

          {!user ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-900">Please login to see your requests.</p>
              <p className="text-sm text-gray-600 mt-2">
                Sign in to access your submitted map requests.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-4 px-4 py-2 rounded-md border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50"
              >
                Login
              </button>
            </div>
          ) : loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <p className="text-sm text-gray-600">Loading your requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-900">You have not submitted any map requests yet.</p>
              <p className="text-sm text-gray-600 mt-2">
                Use the button above to request a custom map design.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">Plot</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {request.plot?.size ?? "-"} {request.plot?.unit ?? ""} • {request.contact?.city || "-"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(request.status || "Pending")}`}
                        >
                          {request.status || "Pending"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenId((prev) => (prev === request._id ? null : request._id))
                          }
                          className="text-gray-500 hover:text-gray-700 transition cursor-pointer"
                          aria-label="Toggle request details"
                        >
                          <span
                            className={`inline-block transition-transform duration-300 ${
                              openId === request._id ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <p>
                        Submitted {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      openId === request._id ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-gray-100 pt-4 space-y-5 text-sm">
                      <section>
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold text-gray-900">Basic Info</h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyles(request.status || "Pending")}`}
                          >
                            {request.status || "Pending"}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
                            <p className="font-medium">{request.contact?.name || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                            <p className="font-medium">{request.contact?.phone || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                            <p className="font-medium">{request.contact?.email || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                            <p className="font-medium">{request.contact?.city || "-"}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-gray-900">Plot Details</h3>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Plot Size</p>
                            <p className="font-medium">{request.plot?.size ?? "-"} {request.plot?.unit || ""}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Dimensions</p>
                            <p className="font-medium">{request.plot?.dimensions || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Facing</p>
                            <p className="font-medium">{request.plot?.facing || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Plot Type</p>
                            <p className="font-medium">{request.plot?.type || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Corner Plot</p>
                            <p className="font-medium">{request.plot?.cornerPlot || "-"}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-gray-900">Layout Requirements</h3>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Bedrooms</p>
                            <p className="font-medium">{request.layout?.bedrooms ?? "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Washrooms</p>
                            <p className="font-medium">{request.layout?.washrooms ?? "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Kitchens</p>
                            <p className="font-medium">{request.layout?.kitchens ?? "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Car Porch</p>
                            <p className="font-medium">{request.layout?.carPorch || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">TV Lounge</p>
                            <p className="font-medium">{request.layout?.tvLounge || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Drawing Room</p>
                            <p className="font-medium">{request.layout?.drawingRoom || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Store Room</p>
                            <p className="font-medium">{request.layout?.storeRoom || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Lawn</p>
                            <p className="font-medium">{request.layout?.lawn || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Terrace</p>
                            <p className="font-medium">{request.layout?.terrace || "-"}</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-gray-900">Notes</h3>
                        <div className="mt-3 border border-dashed border-emerald-200 rounded-lg p-4 text-gray-700 bg-emerald-50/40">
                          {request.notes || "No notes provided."}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-gray-900">Uploaded Files</h3>
                        <div className="mt-3">
                          {!request.uploads || request.uploads.length === 0 ? (
                            <p className="text-gray-500">No files uploaded.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {request.uploads.map((upload) => {
                                const url = getUploadUrl(upload);
                                if (!url) return null;

                                if (isImageUpload(upload)) {
                                  return (
                                    <div key={upload.public_id || url} className="border rounded-lg p-3">
                                      <img
                                        src={url}
                                        alt={upload.name || "Uploaded file"}
                                        className="w-full max-h-40 sm:max-h-48 rounded-md object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  );
                                }

                                if (isPdfUpload(upload)) {
                                  return (
                                    <div key={upload.public_id || url} className="border rounded-lg p-3">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-700 font-semibold hover:underline"
                                      >
                                        View PDF
                                      </a>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={upload.public_id || url} className="border rounded-lg p-3">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-700 font-semibold hover:underline"
                                    >
                                      View File
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-base font-semibold text-gray-900">Sketch</h3>
                        <div className="mt-3">
                          {request.sketch?.secure_url || request.sketchDataUrl ? (
                            <img
                              src={request.sketch?.secure_url || request.sketchDataUrl}
                              alt="Sketch"
                              className="w-full max-h-48 sm:max-h-64 rounded-md object-contain bg-gray-50"
                              loading="lazy"
                            />
                          ) : (
                            <p className="text-gray-500">No sketch uploaded.</p>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyMapRequests;
