import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "@shared/components/ErrorAlert";
import { getUserFriendlyMessage } from "@shared/utils/errorHandler";
import { getAllMapRequests, updateMapRequestStatus } from "@shared/api/mapRequestService";
import { API_BASE_URL } from "@shared/api/apiClient";
import { USER_TOKEN } from "@shared/constants/storageKeys";

type MapRequestStatus = "Pending" | "Contacted" | "In Progress" | "Completed";

type UploadItem = {
  name?: string;
  type?: string;
  secure_url?: string;
  public_id?: string | null;
  url?: string;
};

type MapRequestDetailsData = {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    createdAt?: string;
  } | null;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
  };
  plot?: {
    size?: number;
    unit?: "Marla" | "Sqft" | "Kanal" | string;
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
  sketch?: {
    secure_url?: string;
  } | null;
  sketchDataUrl?: string;
  status?: MapRequestStatus;
  createdAt?: string;
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

const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void }> = ({
  imageUrl,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-full max-w-5xl w-full"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white text-gray-700 shadow flex items-center justify-center"
          aria-label="Close preview"
        >
          ✕
        </button>
        <div className="bg-white rounded-xl p-3">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-[80vh] w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

const MapRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<MapRequestDetailsData | null>(null);
  const [status, setStatus] = useState<MapRequestStatus>("Pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequest = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getAllMapRequests<MapRequestDetailsData[]>();
        const match = Array.isArray(data) ? data.find((item) => item._id === id) : null;
        if (isMounted) {
          setRequest(match || null);
          setStatus(match?.status || "Pending");
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

    fetchRequest();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(null), 2500);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!selectedImage) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [selectedImage]);

  const getUploadUrl = (upload: UploadItem) => upload.secure_url || upload.url || "";

  const buildDownloadUrl = (url: string, filename?: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedName = filename ? `&filename=${encodeURIComponent(filename)}` : "";
    return `${API_BASE_URL}/api/map-requests/download?url=${encodedUrl}${encodedName}`;
  };

  const isImageUpload = (upload: UploadItem) => {
    if (upload.type && upload.type.startsWith("image/")) return true;
    const url = getUploadUrl(upload).toLowerCase();
    return url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".jpeg") || url.endsWith(".webp");
  };

  const getExtensionFromType = (contentType: string | null) => {
    if (!contentType) return "";
    if (contentType.includes("pdf")) return ".pdf";
    if (contentType.includes("png")) return ".png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
    if (contentType.includes("webp")) return ".webp";
    if (contentType.includes("msword")) return ".doc";
    if (contentType.includes("officedocument")) return ".docx";
    return "";
  };

  const getFilenameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const lastSegment = urlObj.pathname.split("/").pop() || "download";
      return lastSegment;
    } catch {
      return "download";
    }
  };

  const handleDownload = async (url: string, filename?: string) => {
    try {
      const token = localStorage.getItem(USER_TOKEN);
      const response = await fetch(buildDownloadUrl(url, filename), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        throw new Error("Download failed");
      }

      const contentType = response.headers.get("content-type");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      let downloadName = filename || getFilenameFromUrl(url);
      if (!downloadName.includes(".")) {
        downloadName += getExtensionFromType(contentType);
      }

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = downloadName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Failed to download file. Please try again.");
    }
  };


  const handleStatusUpdate = async (nextStatus: MapRequestStatus) => {
    if (!id) return;
    setUpdating(true);
    setError(null);

    try {
      await updateMapRequestStatus(id, nextStatus);
      setStatus(nextStatus);
      setRequest((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      setSuccessMessage("Status updated successfully");
    } catch (err) {
      setError(getUserFriendlyMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm text-gray-600">
          Loading map request...
        </div>
      </>
    );
  }

  if (!request) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Request not found</h1>
          <p className="text-sm text-gray-600 mt-2">
            The requested map request does not exist.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/map-requests")}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
          >
            Back to Map Requests
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {selectedImage && (
        <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/map-requests")}
              className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold"
            >
              Map Requests
            </button>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => request.user?._id && navigate(`/admin/users/${request.user?._id}`)}
                className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold cursor-pointer hover:bg-emerald-200 transition"
                aria-label={`View ${request.contact?.name || "User"} profile`}
              >
                {(request.contact?.name || "U").charAt(0).toUpperCase()}
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {request.contact?.name || "Unknown"}
              </h1>
            </div>
            <p className="text-sm text-gray-600">
              Submitted {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "-"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${getStatusStyles(
                status
              )}`}
            >
              {status}
            </span>
            <select
              value={status}
              disabled={updating}
              onChange={(event) => handleStatusUpdate(event.target.value as MapRequestStatus)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-60"
            >
              <option>Pending</option>
              <option>Contacted</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
            <button
              type="button"
              disabled={updating}
              onClick={() => handleStatusUpdate("Contacted")}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold disabled:opacity-60"
            >
              Mark as Contacted
            </button>
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


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
                <p className="font-medium text-gray-900">{request.contact?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Phone</p>
                <p className="font-medium text-gray-900">{request.contact?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Email</p>
                <p className="font-medium text-gray-900">{request.contact?.email || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">City</p>
                <p className="font-medium text-gray-900">{request.contact?.city || "-"}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Plot Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Plot Size</p>
                <p className="font-medium text-gray-900">
                  {request.plot?.size ?? "-"} {request.plot?.unit || ""}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Dimensions</p>
                <p className="font-medium text-gray-900">
                  {request.plot?.dimensions || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Facing</p>
                <p className="font-medium text-gray-900">
                  {request.plot?.facing || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Plot Type</p>
                <p className="font-medium text-gray-900">
                  {request.plot?.type || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Corner Plot</p>
                <p className="font-medium text-gray-900">
                  {request.plot?.cornerPlot || "-"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Requirements</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Bedrooms</p>
                <p className="font-medium text-gray-900">{request.layout?.bedrooms ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Washrooms</p>
                <p className="font-medium text-gray-900">{request.layout?.washrooms ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Kitchens</p>
                <p className="font-medium text-gray-900">{request.layout?.kitchens ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Car Porch</p>
                <p className="font-medium text-gray-900">{request.layout?.carPorch || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">TV Lounge</p>
                <p className="font-medium text-gray-900">{request.layout?.tvLounge || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Drawing Room</p>
                <p className="font-medium text-gray-900">{request.layout?.drawingRoom || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Store Room</p>
                <p className="font-medium text-gray-900">{request.layout?.storeRoom || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Lawn</p>
                <p className="font-medium text-gray-900">{request.layout?.lawn || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Terrace</p>
                <p className="font-medium text-gray-900">{request.layout?.terrace || "-"}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
            <div className="border border-dashed border-emerald-200 rounded-lg p-4 text-sm text-gray-700 bg-emerald-50/40">
              {request.notes || "No notes provided."}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
            <div className="space-y-3">
              {!request.uploads || request.uploads.length === 0 && (
                <p className="text-sm text-gray-500">No files uploaded.</p>
              )}
              {request.uploads?.map((upload, index) => {
                const url = getUploadUrl(upload);
                if (!url) return null;

                return (
                  <div key={`${upload.public_id || upload.name || "file"}-${index}`} className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{upload.name || "Uploaded file"}</p>
                    <p className="text-xs text-gray-500 mt-1">{upload.type || "-"}</p>
                    {isImageUpload(upload) && (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(url)}
                        className="mt-3 w-full"
                        aria-label="Open image preview"
                      >
                        <img
                          src={url}
                          alt={upload.name || "Uploaded file"}
                          className="w-full max-h-48 object-cover rounded-md"
                          loading="lazy"
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownload(url, upload.name)}
                      className="mt-3 inline-block text-sm bg-emerald-600 text-white px-3 py-1 rounded"
                    >
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sketch</h2>
            {request.sketch?.secure_url || request.sketchDataUrl ? (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage(request.sketch?.secure_url || request.sketchDataUrl || "")
                  }
                  className="w-full"
                  aria-label="Open sketch preview"
                >
                  <img
                    src={request.sketch?.secure_url || request.sketchDataUrl}
                    alt="Sketch preview"
                    className="w-full max-h-64 object-contain rounded-lg border bg-gray-50"
                    loading="lazy"
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      request.sketch?.secure_url || request.sketchDataUrl || "",
                      "sketch"
                    )
                  }
                  className="mt-3 inline-block text-sm bg-emerald-600 text-white px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No sketch provided.</p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default MapRequestDetails;
