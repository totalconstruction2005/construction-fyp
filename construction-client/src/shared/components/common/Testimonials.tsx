import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faStarHalfAlt ,
  faQuoteRight,
} from "@fortawesome/free-solid-svg-icons";
import user1 from "@assets/img1.jpg";
import user2 from "@assets/img2.jpg";
import user3 from "@assets/img3.jpg";

function Testimonials() {
  const testimonials = [
    {
      name: "Martin Roberts",
      role: "Residential Construction",
      text: "It turned our dream home into reality. The attention to detail and craftsmanship were truly outstanding.",
      img: user1,
      rating: 4.5,
    },
    {
      name: "Emily Blunt",
      role: "Commercial Project",
      text: "Professional, punctual, and reliable — Total Construction delivered our office space on time and beyond expectations.",
      img: user2,
      rating: 4,
    },
    {
      name: "Sarah Johnson",
      role: "Renovation",
      text: "From the first consultation to the final handover, Total Construction made the process smooth and stress-free.",
      img: user3,
      rating: 5,
    },
  ];

  const [centerIndex, setCenterIndex] = useState(0);
  const [prevCenterIndex, setPrevCenterIndex] = useState<number | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    review: "",
  });
  const [showThankYou, setShowThankYou] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    // Show thank you message
    setShowThankYou(true);
    // Reset form
    setReviewForm({ name: "", rating: 5, review: "" });
    // Close modal after 2 seconds
    setTimeout(() => {
      setShowReviewModal(false);
      setShowThankYou(false);
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevCenterIndex(centerIndex);
      setCenterIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [centerIndex]);

  const getStyle = (index: number) => {
    const prevIndex = (centerIndex - 1 + testimonials.length) % testimonials.length;
    const nextIndex = (centerIndex + 1) % testimonials.length;

    if (index === centerIndex) {
      return {
        transform: "translateX(0%) scale(1.05)",
        zIndex: 20,
        opacity: 1,
      };
    } else if (index === prevIndex) {
      return {
        transform: "translateX(-100%) scale(0.85)",
        zIndex: 10,
        opacity: 0.6,
      };
    } else if (index === nextIndex) {
      return {
        transform: "translateX(100%) scale(0.85)",
        zIndex: 10,
        opacity: 0.6,
      };
    } else if (index === prevCenterIndex) {
      const direction =
        index < centerIndex || (centerIndex === 0 && index === testimonials.length - 1)
          ? -1
          : 1;
      return {
        transform: `translateX(${direction * 120}%) scale(0.85)`,
        zIndex: 5,
        opacity: 0,
      };
    } else {
      return { display: "none" };
    }
  };

  // ⭐ RENDER STARS (always 5)
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className="text-yellow-400 mr-1 text-xs"
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStarHalfAlt}
            className="text-yellow-400 mr-1 text-xs"
          />
        );
      } else {
        stars.push(
          <FontAwesomeIcon
            key={i}
            icon={faStar}
            className="text-gray-300 mr-1 text-xs"
          />
        );
      }
    }
    return stars;
  };

  return (
    <section className="bg-gray-50 py-7 sm:py-7 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center w-[95%] sm:w-[85%]">
        {/* Heading */}
        <p className="text-sm font-semibold uppercase text-teal-800 tracking-wider mb-2">
          Testimonials
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          What Our Clients Say
        </h2>

        {/* Add Review Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-teal-900 text-lime-300 px-8 py-2 rounded-full text-md font-semibold hover:bg-teal-800 transition"
          >
            Add a Review
          </button>
        </div>

        {/* Review Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
              {!showThankYou ? (
                <>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Add Your Review</h3>
                  <form onSubmit={handleSubmitReview}>
                    <div className="mb-4">
                      <label className="block text-left text-sm font-semibold text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-800"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-left text-sm font-semibold text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="text-2xl focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={faStar}
                              className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-left text-sm font-semibold text-gray-700 mb-2">
                        Review
                      </label>
                      <textarea
                        value={reviewForm.review}
                        onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-800 h-32 resize-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-900 text-lime-300 px-6 py-3 rounded-full text-sm font-semibold hover:bg-teal-800 transition"
                    >
                      Submit Review
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="relative flex justify-center items-center min-h-[15rem]">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className="absolute bg-white rounded-2xl shadow-lg p-8 pt-4 pb-4 w-80% sm:w-[24rem] text-left transition-all duration-700 ease-in-out"
              style={getStyle(index)}
            >
              <FontAwesomeIcon
                icon={faQuoteRight}
                className="absolute top-6 right-6 text-teal-900 text-xl opacity-30"
              />

              {/* Stars */}
              <div className="flex mb-3">{renderStars(item.rating)}</div>

              {/* Role */}
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.role}
              </h3>

              {/* Text */}
              <p className="text-gray-600 text-xs leading-relaxed mb-4">
                {item.text}
              </p>

              {/* Profile */}
              <div className="flex items-center gap-3 mt-auto">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
                <p className="font-semibold text-gray-800 text-sm">
                  {item.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
