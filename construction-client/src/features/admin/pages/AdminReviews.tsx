import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faSearch,
  faCheck,
  faTimes,
  faTrash,
  faEdit,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";

import { apiClient } from "@shared/api/apiClient";

type Review = {
  _id: string;
  name: string;
  rating: number;
  review: string;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
};

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "approved" | "pending" | "active" | "inactive"
  >("all");
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    rating: 5,
    review: "",
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get<any>(
        `/api/reviews/admin?search=${encodeURIComponent(search)}`,
      );
      if (result.success) {
        setReviews(result.data);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchReviews();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const handleUpdateStatus = async (id: string, updates: Partial<Review>) => {
    try {
      const result = await apiClient.put<any>(
        `/api/reviews/admin/${id}`,
        updates,
      );
      if (result.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...result.data } : r)),
        );
      } else {
        alert(result.message || "Failed to update review");
      }
    } catch (error: any) {
      console.error("Error updating review status:", error);
      alert(error?.message || "Failed to update review");
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const result = await apiClient.delete<any>(`/api/reviews/admin/${id}`);
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      } else {
        alert(result.message || "Failed to delete review");
      }
    } catch (error: any) {
      console.error("Error deleting review:", error);
      alert(error?.message || "Failed to delete review");
    }
  };

  const handleStartEdit = (review: Review) => {
    setEditingReview(review);
    setEditForm({
      name: review.name,
      rating: review.rating,
      review: review.review,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;

    try {
      const result = await apiClient.put<any>(
        `/api/reviews/admin/${editingReview._id}`,
        editForm,
      );
      if (result.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === editingReview._id ? { ...r, ...result.data } : r,
          ),
        );
        setEditingReview(null);
      } else {
        alert(result.message || "Failed to update review content");
      }
    } catch (error: any) {
      console.error("Error editing review content:", error);
      alert(error?.message || "Failed to update review");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`mr-1 text-xs ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesFilter = true;

    switch (filter) {
      case "approved":
        matchesFilter = review.isApproved;
        break;

      case "pending":
        matchesFilter = !review.isApproved;
        break;

      case "active":
        matchesFilter = review.isActive;
        break;

      case "inactive":
        matchesFilter = !review.isActive;
        break;

      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-sm border border-gray-100 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
            Management
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Client Reviews Management
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Approve, reject, activate, deactivate, and edit reviews submitted by
            clients.
          </p>
        </div>
      </div>

      {/* Toolbar */}
     <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">

  <div className="relative flex-1 w-full md:max-w-md">
    <input
      type="text"
      placeholder="Search reviews by name..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />

    <FontAwesomeIcon
      icon={faSearch}
      className="absolute left-3.5 top-3 text-gray-400 text-sm"
    />
  </div>

  <select
    value={filter}
    onChange={(e) =>
      setFilter(e.target.value as any)
    }
    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
  >
    <option value="all">
      All Reviews
    </option>

    <option value="approved">
      Approved
    </option>

    <option value="pending">
      Pending
    </option>

    <option value="active">
      Active
    </option>

    <option value="inactive">
      Inactive
    </option>
  </select>

</div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Approved</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    Loading reviews...
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {review.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 max-w-xs truncate text-gray-600"
                      title={review.review}
                    >
                      {review.review}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {review.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${review.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {review.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Approve / Reject */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(review._id, {
                            isApproved: !review.isApproved,
                          })
                        }
                        className={`p-1.5 rounded-lg border transition ${
                          review.isApproved
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={
                          review.isApproved ? "Reject Review" : "Approve Review"
                        }
                      >
                        <FontAwesomeIcon
                          icon={review.isApproved ? faTimes : faCheck}
                          className="w-4 h-4"
                        />
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        onClick={() =>
                          handleUpdateStatus(review._id, {
                            isActive: !review.isActive,
                          })
                        }
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        title={review.isActive ? "Deactivate" : "Activate"}
                      >
                        <FontAwesomeIcon
                          icon={review.isActive ? faToggleOn : faToggleOff}
                          className="w-4 h-4"
                        />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(review)}
                        className="p-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition"
                        title="Edit Review Content"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                        title="Delete Review"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Edit Review
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rating
                </label>
                <select
                  value={editForm.rating}
                  onChange={(e) =>
                    setEditForm({ ...editForm, rating: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Review Content
                </label>
                <textarea
                  value={editForm.review}
                  onChange={(e) =>
                    setEditForm({ ...editForm, review: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 h-28 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
