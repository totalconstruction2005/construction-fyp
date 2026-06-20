import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/apiClient";
type PopularCalculationsResponse = {
  success: boolean;
  data: PopularCalculation[];
};

type PopularCalculation = {
  _id: string;
  region: string;
  area: number;
  unit: string;
  coveredArea: number;
  constructionType:
    | "complete"
    | "grey_structure";
  mode:
    | "with_material"
    | "without_material";
  isActive: boolean;
};

const PopularCalculations: React.FC = () => {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const [items, setItems] = useState<
    PopularCalculation[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const scroll = (
    direction: "left" | "right"
  ) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left:
          direction === "left"
            ? -400
            : 400,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const response =
  (await apiClient.get(
    "/api/estimator/popular-calculations"
  )) as PopularCalculationsResponse;

setItems(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (
    item: PopularCalculation
  ) => {
    const params =
      new URLSearchParams({
        city: item.region,
        area: String(item.area),
        unit: item.unit,
        type:
          item.constructionType ===
          "grey_structure"
            ? "Grey Structure"
            : "Complete",
        mode:
          item.mode ===
          "with_material"
            ? "With Material"
            : "Without Material",
        coveredArea: String(
          item.coveredArea
        ),
      });

    navigate(
      `/estimator/final-construction-cost?${params.toString()}`
    );
    window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  };

  return (
    <section className="relative w-full bg-white py-8">
      <div className="w-full mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Popular Construction
          Calculations
        </h2>

        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() =>
              scroll("left")
            }
            className="absolute left-0 top-1/2 cursor-pointer -translate-y-1/2 z-10 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 hidden sm:block"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-8 no-scrollbar"
          >
            {loading ? (
              <div className="p-6 text-gray-500">
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-gray-500">
                No calculations found
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  onClick={() =>
                    handleCardClick(
                      item
                    )
                  }
                  className="min-w-[220px] bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex-shrink-0 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <h3 className="text-md font-semibold text-gray-800 leading-tight">
                    {item.area}{" "}
                    {item.unit}
                    <br />
                    Construction Cost
                  </h3>

                  <p className="text-gray-500 text-sm mt-3">
                    {item.region}
                    
                  </p>

                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-xs">
                      {item.constructionType ===
                      "complete"
                        ? "Complete House"
                        : "Grey Structure"}
                    </span>
                  </div>

                  <div className="text-blue-600 text-sm font-medium mt-4 inline-flex items-center">
                    Details
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() =>
              scroll("right")
            }
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 cursor-pointer bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 hidden sm:block"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default PopularCalculations;