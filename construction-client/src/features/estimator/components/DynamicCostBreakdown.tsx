import React, { useState } from "react";

type Node = {
  _id: string;
  name: string;
  percentage: number;
  amount: number;
  notes?: string;
  children?: Node[];
};

const RenderNode: React.FC<{ node: Node; depth?: number }> = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(true);
  const hasChildren = !!node.children?.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50 sm:px-6 md:px-8 md:py-5"
        style={{ paddingLeft: `${depth * 24 + 20}px` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          {hasChildren ? (
            <span className="w-4 shrink-0 text-center text-xs text-gray-400">
              {open ? "▾" : "▸"}
            </span>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          <div className="min-w-0">
            <span
              className={`block truncate text-sm ${
                depth === 0
                  ? "font-semibold text-gray-800 sm:text-[15px] md:text-base lg:text-[17px]"
                  : "font-medium text-gray-700"
              }`}
            >
              {node.name}
            </span>
            {node.notes && (
              <span className="block truncate text-xs text-gray-400 mt-0.5">
                {node.notes}
              </span>
            )}
          </div>
        </div>

        <span
          className={`shrink-0 text-sm ${
            depth === 0
              ? "font-semibold text-gray-700 sm:text-[15px] md:text-base lg:text-[17px]"
              : "font-semibold text-gray-700"
          }`}
        >
          PKR {Number(node.amount).toLocaleString()}
        </span>
      </button>

      {hasChildren && open && (
        <div className="divide-y divide-gray-100">
          {node.children!.map((child) => (
            <RenderNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const DynamicCostBreakdown: React.FC<{ breakdown: Node[] }> = ({ breakdown }) => {
  if (!breakdown || breakdown.length === 0) {
    return <p className="text-gray-500">No breakdown available.</p>;
  }

  return (
    <section className="mt-8 space-y-6 md:mt-10 md:space-y-8">
      {breakdown.map((node) => (
        <div
          key={node._id}
          className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-4 bg-emerald-50 px-5 py-4 sm:px-6 md:px-8 md:py-5">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-800 md:text-lg">
                {node.name}
              </h3>
              {node.notes && (
                <p className="mt-0.5 text-sm text-gray-500">{node.notes}</p>
              )}
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 md:text-sm">
                Total
              </p>
              <p className="mt-1 text-base font-bold text-emerald-600 sm:text-lg md:text-2xl">
                PKR {Number(node.amount).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {node.children && node.children.length > 0 ? (
              node.children.map((child) => (
                <RenderNode key={child._id} node={child} depth={1} />
              ))
            ) : (
              <div className="px-5 py-4 text-sm text-gray-500 sm:px-6 md:px-8 md:py-5">
                No sub-items available.
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default DynamicCostBreakdown;
