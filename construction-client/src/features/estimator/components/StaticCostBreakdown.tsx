import React from "react";
import { Droplets, Home, PlugZap, Paintbrush, Wrench } from "lucide-react";

type BreakdownRow = {
  label: string;
  value: string;
};

type BreakdownSection = {
  title: string;
  description: string;
  total: string;
  icon: React.ReactNode;
  accent: string;
  rows: BreakdownRow[];
};

const breakdownSections: BreakdownSection[] = [
  {
    title: "Plumbing Works",
    description: "Plumbing works include underground piping and drainage systems materials.",
    total: "44.05 Lakh",
    icon: <Droplets className="h-5 w-5 text-emerald-700" />,
    accent: "bg-emerald-50",
    rows: [
      { label: "AC Drainage System", value: "1.79 Lakh" },
      { label: "Cold and Hot Water Supply", value: "5.23 Lakh" },
      { label: "Drainage System Piping", value: "8.51 Lakh" },
      { label: "Gas Piping", value: "7.85 Lakh" },
      { label: "Insulation Armaflex", value: "2.65 Lakh" },
      { label: "Pumps and Drains", value: "4.39 Lakh" },
      { label: "UPVC Pipeline for Sewerage System", value: "4.3 Lakh" },
      { label: "Labor Cost", value: "9.34 Lakh" },
    ],
  },
  {
    title: "Electrical Works",
    description: "Electrical works include underground wiring and all electrical items.",
    total: "61.13 Lakh",
    icon: <PlugZap className="h-5 w-5 text-emerald-700" />,
    accent: "bg-emerald-50",
    rows: [
      { label: "Conduits & Accessories", value: "5.21 Lakh" },
      { label: "Lights, Fans and Chandeliers", value: "4.97 Lakh" },
      { label: "Switches and Back Boxes", value: "2.24 Lakh" },
      { label: "Wires & Cables", value: "38.88 Lakh" },
      { label: "Labor Cost", value: "9.83 Lakh" },
    ],
  },
  {
    title: "Wood, Metal & Tile Works",
    description: "Wood, Metal & Tile Works include cabinets, wardrobes, flooring, and all aluminum and iron works.",
    total: "2.48 Crore",
    icon: <Paintbrush className="h-5 w-5 text-emerald-700" />,
    accent: "bg-emerald-50",
    rows: [
      { label: "Metal Works", value: "12.79 Lakh" },
      { label: "Paint and Ceiling Works", value: "68.58 Lakh" },
      { label: "Tile Work", value: "1.59 Crore" },
      { label: "Wardrobes & Cabinets", value: "5.94 Lakh" },
      { label: "Windows", value: "2.53 Lakh" },
    ],
  },
  {
    title: "Fittings & Fixtures",
    description: "Fittings & Fixtures include kitchen and bath accessories.",
    total: "9.13 Lakh",
    icon: <Wrench className="h-5 w-5 text-emerald-700" />,
    accent: "bg-emerald-50",
    rows: [
      { label: "Bathroom", value: "6.61 Lakh" },
      { label: "Gyser & Manhole", value: "1.97 Lakh" },
      { label: "Kitchen", value: "55 Thousand" },
    ],
  },
  {
    title: "Foundation & Structure",
    description: "Foundation & Structure includes materials for the basic house structure including foundation, floors, walls, roofing, and plastering.",
    total: "6.06 Crore",
    icon: <Home className="h-5 w-5 text-emerald-700" />,
    accent: "bg-emerald-50",
    rows: [
      { label: "Bricks, Cement, Sand, & Crush", value: "4.03 Crore" },
      { label: "Excavation & Steel Reinforcement", value: "1.05 Crore" },
      { label: "Roof Insulation, Termite & Water Proofing", value: "7.17 Lakh" },
      { label: "Labor Cost", value: "90.91 Lakh" },
    ],
  },
];

const StaticCostBreakdown: React.FC = () => {
  return (
    <section className="mt-8 space-y-6 md:mt-10 md:space-y-8">
      {breakdownSections.map((section) => (
        <div key={section.title} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className={`flex items-start justify-between gap-4 px-5 py-4 sm:px-6 md:px-8 md:py-5 ${section.accent}`}>
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100 md:h-11 md:w-11">
                {section.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 md:text-lg">{section.title}</h3>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-gray-500 sm:text-sm md:text-[15px] md:leading-6">
                  {section.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">Total</p>
              <p className="mt-1 text-base font-bold text-emerald-600 sm:text-lg md:text-2xl">{section.total}</p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {section.rows.map((row) => (
              <button
                key={row.label}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6 md:px-8 md:py-5"
              >
                <span className="text-sm font-medium text-gray-800 sm:text-[15px] md:text-base lg:text-[17px]">
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-gray-700 sm:text-[15px] md:text-base lg:text-[17px]">
                  {row.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default StaticCostBreakdown;