import React, { useState, useEffect } from "react";
import { MyNavbar, Footer } from "@layouts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";

import { apiClient } from "@shared/api/apiClient";

type Review = {
  _id: string;
  name: string;
  rating: number;
  review: string;
  createdAt: string;
};

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const result = await apiClient.get<any>("/api/reviews");
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
    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={`mr-1 text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MyNavbar transparent={false} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-emerald-100 py-10 mt-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm font-semibold uppercase text-teal-800 tracking-wider mb-2">
            Reviews
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            What Our Clients Say
          </h1>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            Read stories and experiences shared by our valued clients. We are proud of our commitment to excellence.
          </p>
        </div>
      </section>

      {/* Reviews List */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-12">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No reviews found. Be the first to add one!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex mb-3">{renderStars(item.rating)}</div>
                  <p className="text-gray-700 text-sm italic mb-4 leading-relaxed">
                    "{item.review}"
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ReviewsPage;
