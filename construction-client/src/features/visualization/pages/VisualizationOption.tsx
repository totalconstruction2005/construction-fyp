import React, { useEffect, useState } from "react";
import { MyNavbar, Footer } from "@layouts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@features/auth";
import { getPublicFloorPlans } from "@features/admin/api/floorPlan.api";
import type { FloorPlan } from "@features/admin/api/floorPlan.api";
import { useErrorHandler } from "@shared/hooks/useErrorHandler";
import { ErrorAlert } from "@shared/components";
import designStudioImg from "@assets/design-studio-main-img.jpg";
import VisualizationGallery from "../components/VisualizationGallery";

const HERO_CENTER_IMG = designStudioImg;

/**
 * VisualizationCard interface for gallery display
 */
interface VisualizationCard {
  id: string;
  title: string;
  img: string;
  marla: string;
  marlaValue: number;
  rooms: number;
  washrooms: number;
  category: "residential" | "commercial";
}

/**
 * Transform FloorPlan API response to VisualizationCard format
 */
const transformFloorPlanToCard = (floorPlan: FloorPlan): VisualizationCard => {
  return {
    id: floorPlan._id,
    title: floorPlan.title,
    img: floorPlan.image.secure_url,
    marla: `${floorPlan.marlaSize} Marla`,
    marlaValue: floorPlan.marlaSize,
    rooms: floorPlan.rooms,
    washrooms: floorPlan.washrooms,
    category: floorPlan.category,
  };
};

/**
 * VisualizationOption Page Component
 * 
 * Main page for browsing and filtering visualization/floor plan designs.
 * Fetches floor plans from backend API and displays in gallery grid.
 */
const VisualizationOption: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { errorMessage, handleError } = useErrorHandler();

  const [cards, setCards] = useState<VisualizationCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Fetch floor plans on component mount
  useEffect(() => {
    const fetchFloorPlans = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        console.log("🔍 Fetching public floor plans...");
        const floorPlans = await getPublicFloorPlans();
        console.log("✅ Floor plans received:", floorPlans);
        const transformedCards = floorPlans.map(transformFloorPlanToCard);
        console.log("✅ Transformed cards:", transformedCards);
        setCards(transformedCards);
      } catch (err) {
        console.error("❌ Error fetching floor plans:", err);
        handleError(err);
        setHasError(true);
        // Keep showing empty state instead of crashing
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFloorPlans();
  }, []);

  const handleHeroCustomDesignClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/design-studio/custom-design" } });
    } else {
      navigate("/design-studio/custom-design");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-green-50 to-emerald-50">
      <MyNavbar transparent={false} />

      {/* spacer for fixed navbar */}
      <div className="h-6 sm:h-8" />

      {/* Error Alert */}
      {hasError && errorMessage && (
        <div className="max-w-7xl mx-auto w-full px-3 mt-4">
          <ErrorAlert message={errorMessage} />
        </div>
      )}

      {/* HERO Section */}
      <header className="w-full mb-5">
        <div className="w-full bg-emerald-50 border-b border-emerald-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left: text box */}
              <div className="lg:col-span-7 col-span-1 px-3">
                <div className="min-h-fit sm:min-h-[20rem] lg:h-[22rem] w-full bg-white border-r border-emerald-100 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <h1 className="text-1xl sm:text-3xl lg:text-4xl mt-2 font-extrabold leading-tight text-emerald-900">
                      LET US HELP
                      <br />
                      YOU BRING YOUR
                      <br />
                      DREAM HOME TO LIFE
                    </h1>

                    <div className="mt-3">
                      <div className="inline-block bg-gradient-to-r from-gray-800 to-gray-400 text-white px-4 py-2 rounded-sm text-sm">
                        Get a customized{" "}
                        <span className="font-semibold">House map design</span>{" "}
                        today!
                      </div>
                    </div>

                    <ul className="mt-3 space-y-2 text-gray-700 text-sm">
                      <li>
                        Experienced designers who understand your unique needs
                      </li>
                      <li>
                        Personalized consultations to ensure your design meets
                        requirements
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-3">
                    <button
                      onClick={handleHeroCustomDesignClick}
                      className="bg-emerald-700 text-xs hover:bg-emerald-800 text-white font-semibold px-3 py-2 rounded-md shadow"
                      type="button"
                    >
                      Request Custom Map
                    </button>

                    <button
                      onClick={() => navigate("/design-studio/my-requests")}
                      className="bg-white border text-xs border-gray-200 text-gray-800 font-medium px-3 py-2 rounded-md hover:shadow"
                      type="button"
                    >
                      My Map Requests
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: hero image */}
              <div className="lg:col-span-5 col-span-1 border-2">
                <div className="min-h-fit sm:min-h-[20rem] lg:h-[22rem] w-full bg-gray-100 flex items-stretch justify-center overflow-hidden">
                  <img
                    src={HERO_CENTER_IMG}
                    alt="Building preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Section */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto w-full px-3 py-16 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <p className="mt-4 text-gray-600">Loading floor plans...</p>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className="max-w-7xl mx-auto w-full px-3 py-16 text-center">
          <p className="text-gray-600 text-lg">No floor plans available at the moment.</p>
          <p className="text-gray-500 text-sm mt-2">Please check back later or contact us for more information.</p>
        </div>
      ) : (
        <VisualizationGallery cards={cards} initialFilter="All" />
      )}

      <Footer />

      {/* Floating chat CTA */}
      <a
        href="https://wa.me/1234567890"
        target="_blank"
        rel="noreferrer"
        className="fixed right-5 bottom-5 z-50 rounded-full bg-emerald-600 hover:bg-emerald-700 p-3 shadow-lg flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
        >
          <path
            d="M21 12.08a9 9 0 10-2.64 6.36L21 21l-1.56-5.64A8.96 8.96 0 0021 12.08z"
            fill="currentColor"
          />
          <path
            d="M16.5 11.5c-.23-.12-1.38-.68-1.6-.75-.22-.07-.38-.12-.54.12s-.62.75-.77.9c-.14.15-.28.17-.51.06-.23-.12-.98-.36-1.86-1.14-.69-.62-1.15-1.38-1.29-1.61-.14-.23-.01-.35.1-.47.1-.1.23-.28.35-.42.12-.14.16-.24.23-.4.07-.16 0-.3-.04-.42-.04-.12-.54-1.28-.74-1.75-.2-.46-.4-.4-.55-.4-.14 0-.3 0-.46 0-.16 0-.42.06-.64.3-.22.24-.86.84-.86 2.05s.88 2.37 1 2.54c.12.17 1.8 2.75 4.36 3.73 2.56.99 2.56.66 3.01.62.45-.04 1.46-.6 1.66-1.18.2-.57.2-1.06.14-1.17-.06-.12-.22-.17-.45-.29z"
            fill="white"
          />
        </svg>
      </a>
    </div>
  );
};

export default VisualizationOption;
