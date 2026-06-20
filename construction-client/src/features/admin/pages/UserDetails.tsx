import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorAlert from "@shared/components/ErrorAlert";
import { getUserFriendlyMessage } from "@shared/utils/errorHandler";
import { getUserById } from "@shared/api/userService";

type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
};

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getUserById(id);
        if (isMounted) {
          setUser(data || null);
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

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm text-gray-600">
          Loading user details...
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900">User not found</h1>
          <p className="text-sm text-gray-600 mt-2">
            The requested user profile does not exist.
          </p>
          <button
            type="button"
            onClick={() => navigate("/admin/map-requests")}
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm"
          >
            Back to Map Request
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <button
          type="button"
          onClick={() => navigate("/admin/map-requests")}
          className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold"
        >
          Back to Map Request
        </button>

        {error && (
          <div className="mt-4">
            <ErrorAlert message={error} onClose={() => setError(null)} />
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-semibold">
            {(user.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name || "Unknown"}</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email || "-"}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">
                Partner since {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
