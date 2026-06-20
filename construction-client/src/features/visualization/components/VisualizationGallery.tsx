import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export interface VisualizationCard {
  id: string;
  title: string;
  img: string;
  marla: string;
  marlaValue: number;
  rooms: number;
  washrooms: number;
  category: "residential" | "commercial";
}

interface VisualizationGalleryProps {
  /** Array of visualization cards to display */
  cards: VisualizationCard[];
  /** Optional initial marla filter value - defaults to "3" */
  initialFilter?: string;
  /** Callback when a card is clicked - defaults to navigating to 3d-map */
  onCardClick?: () => void;
}

/**
 * VisualizationGallery Component
 * 
 * Displays a filterable gallery of floor plan cards with search functionality.
 * Includes marla size filter with searchable dropdown.
 * 
 * Can be used standalone or as part of VisualizationOption page.
 */
const VisualizationGallery: React.FC<VisualizationGalleryProps> = ({
  cards,
  initialFilter = "3",
  onCardClick,
}) => {
  const navigate = useNavigate();
  const [filterMarla, setFilterMarla] = useState<string>(initialFilter);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchInput, setSearchInput] = useState<string>(initialFilter);
  const [showMarlaDropdown, setShowMarlaDropdown] = useState<boolean>(false);
  const marlaDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marlaDropdownRef.current && !marlaDropdownRef.current.contains(event.target as Node)) {
        setShowMarlaDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate marla options from 2 to 99 (plus "All")
  const marlaOptions = useMemo(
    () => ["All", ...Array.from({ length: 98 }, (_, i) => String(i + 2))],
    []
  );

  // Category options
  const categoryOptions = useMemo(
    () => ["All", "Residential", "Commercial"],
    []
  );

  // Filter marla options based on search input
  const filteredMarlaOptions = useMemo(() => {
    if (!searchInput) return marlaOptions;
    const query = searchInput.toLowerCase();
    return marlaOptions.filter((opt) =>
      opt === "All" ? true : opt.includes(query)
    );
  }, [searchInput, marlaOptions]);

  // Filter cards based on selected marla and category
  const filteredCards = useMemo(() => {
    let result = cards;
    
    // Filter by category
    if (filterCategory !== "All") {
      const categoryFilter = filterCategory.toLowerCase() as "residential" | "commercial";
      result = result.filter((c) => c.category === categoryFilter);
    }
    
    // Filter by marla
    if (filterMarla !== "All") {
      result = result.filter(
        (c) => c.marlaValue === parseInt(filterMarla, 10)
      );
    }
    
    return result;
  }, [filterMarla, filterCategory, cards]);

  // Handle marla selection
  const handleSelectMarla = (value: string) => {
    setFilterMarla(value);
    setSearchInput(value === "All" ? "All" : value);
    setShowMarlaDropdown(false);
  };

  // Handle category selection
  const handleSelectCategory = (value: string) => {
    setFilterCategory(value);
  };

  // Handle card click
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick();
    } else {
      navigate(`/design-studio/3d-map`);
    }
  };

  return (
    <main className="w-full flex-grow flex flex-col items-center px-4">
      <div className="w-full max-w-5xl">
        {/* Filter toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          {/* Marla Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <label
              htmlFor="filterMarla"
              className="text-sm text-gray-700 font-medium whitespace-nowrap"
            >
              Marla
            </label>
            <div className="relative w-full sm:w-48" ref={marlaDropdownRef}>
              <input
                id="filterMarla"
                type="text"
                placeholder="Search marla..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowMarlaDropdown(true);
                }}
                onFocus={() => setShowMarlaDropdown(true)}
                className="w-full border border-emerald-200 bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              
              {showMarlaDropdown && filteredMarlaOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-emerald-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {filteredMarlaOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectMarla(opt)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition-colors ${
                        filterMarla === opt ? "bg-emerald-100 font-semibold text-emerald-700" : "text-gray-700"
                      }`}
                    >
                      {opt === "All" ? "All Marla" : `${opt} Marla`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
            <label
              htmlFor="filterCategory"
              className="text-sm text-gray-700 font-medium whitespace-nowrap"
            >
              Category
            </label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => handleSelectCategory(e.target.value)}
              className="w-full sm:w-auto border border-emerald-200 bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {categoryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredCards.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl shadow p-6 text-center text-gray-600">
              No maps found for this Marla.
            </div>
          ) : (
            filteredCards.map((card) => (
              <article
                  key={card.id}
                  className="bg-white rounded-2xl shadow overflow-hidden transition-shadow duration-200 hover:shadow-lg cursor-pointer"
                  onClick={handleCardClick}
                >
                  <div className="relative h-36 sm:h-48 w-full">
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="object-contain w-full h-full bg-white p-4"
                  />
                  <div className="absolute left-3 top-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {card.marla}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {card.title}
                    </h3>
                    <span className="inline-block bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                      {card.category}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>🛏 {card.rooms} Rooms</span>
                    <span>
                      🚿 {card.washrooms} Washroom{card.washrooms > 1 && "s"}
                    </span>
                    <span className="text-teal-700 font-semibold hover:underline ">
                      3D view
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {/* CTA box */}
        <div className="bg-white rounded-2xl shadow p-6 text-center mb-10">
          <p className="text-gray-600">
            Didn't find what you need?{" "}
            <button
              onClick={() => navigate("/design-studio/custom-design")}
              className="text-emerald-600 hover:underline"
            >
              Request a custom map
            </button>
            .
          </p>
        </div>
      </div>
    </main>
  );
};

export default VisualizationGallery;
