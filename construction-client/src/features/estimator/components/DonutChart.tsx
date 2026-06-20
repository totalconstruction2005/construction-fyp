import React, { useState } from "react";

type ChartItem = {
  label: string;
  value: number;
  amount?: number;
};

type DonutChartProps = {
  data: ChartItem[];
  total: number;
  title?: string;
};

const CHART_COLORS = [
  "#55C1C9",
  "#1E8DD6",
  "#8D7AE8",
  "#F7A600",
  "#EF3B3B",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#6366F1",
  "#A855F7",
];

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  total,
  title,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredData = data.filter(
    (item) => Number(item.value) > 0
  );

  const chartTotal = filteredData.reduce(
    (sum, item) => sum + Number(item.value),
    0
  );

  const size = 320;
  const center = size / 2;
  const radius = 105;
  const strokeWidth = 24;
  const hoveredStrokeWidth = 30;
  const circumference = 2 * Math.PI * radius;

  const formatPKR = (amount: number) => {
    const value = Number(amount || 0);

    if (value >= 10000000) {
      return `${(value / 10000000).toFixed(2)} Crore`;
    }

    if (value >= 100000) {
      return `${(value / 100000).toFixed(2)} Lakh`;
    }

    return `PKR ${Math.round(value).toLocaleString()}`;
  };

  const getCenterData = () => {
    if (
      hoveredIndex !== null &&
      filteredData[hoveredIndex]
    ) {
      const item = filteredData[hoveredIndex];

      return {
        label: item.label,
        amount: formatPKR(
          item.amount ?? item.value
        ),
      };
    }

    return {
      label: title || "Total Cost",
      amount: formatPKR(total),
    };
  };

  const centerData = getCenterData();

  let accumulated = 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
        {/* DONUT */}
        <div className="relative w-[340px] h-[340px] flex-shrink-0">
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
          >
            {/* Background Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {filteredData.map((item, idx) => {
              const fraction =
                chartTotal > 0
                  ? Number(item.value) /
                    chartTotal
                  : 0;

              const segmentLength =
                fraction * circumference;

              const dashArray = `${segmentLength} ${circumference}`;

              const dashOffset =
                -accumulated * circumference;

              accumulated += fraction;

              const isHovered =
                hoveredIndex === idx;

              return (
                <circle
                  key={`${item.label}-${idx}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={
                    CHART_COLORS[
                      idx %
                        CHART_COLORS.length
                    ]
                  }
                  strokeWidth={
                    isHovered
                      ? hoveredStrokeWidth
                      : strokeWidth
                  }
                  strokeLinecap="butt"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredIndex(idx)
                  }
                  onMouseLeave={() =>
                    setHoveredIndex(null)
                  }
                />
              );
            })}
          </svg>

          {/* CENTER */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-xs uppercase text-gray-400 font-semibold tracking-wide">
              {centerData.label}
            </div>

            <div className="text-3xl font-bold text-gray-800 mt-2">
              {centerData.amount}
            </div>
          </div>
        </div>

        {/* LEGEND */}
        <div className="flex-1 w-full space-y-4">
          {filteredData.map((item, idx) => {
            const isHovered =
              hoveredIndex === idx;

            return (
              <div
                key={`${item.label}-${idx}`}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isHovered
                    ? "bg-gray-50 border-gray-200"
                    : "border-gray-100"
                }`}
                onMouseEnter={() =>
                  setHoveredIndex(idx)
                }
                onMouseLeave={() =>
                  setHoveredIndex(null)
                }
              >
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{
                    background:
                      CHART_COLORS[
                        idx %
                          CHART_COLORS.length
                      ],
                  }}
                />

                <div className="flex items-center gap-2 text-base">
                  <span className="text-gray-600 capitalize">
                    {item.label}
                  </span>

                  <span className="font-bold">
                    •
                  </span>

                  <span className="font-semibold text-gray-900">
                    {formatPKR(
                      item.amount ??
                        item.value
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};