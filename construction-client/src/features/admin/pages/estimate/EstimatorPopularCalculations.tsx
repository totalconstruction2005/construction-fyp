import { useEffect, useState } from "react";
import {
  getPopularCalculations,
  getEstimatorRegions,
  createPopularCalculation,
  updatePopularCalculation,
  deletePopularCalculation,
  togglePopularCalculation,
  reorderPopularCalculation,
  type PopularCalculation,
  type EstimatorRegion,
} from "../../api/estimator.api";

const EstimatorPopularCalculations = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<PopularCalculation[]>([]);
  const [regions, setRegions] = useState<EstimatorRegion[]>([]);

  const [editingItem, setEditingItem] = useState<PopularCalculation | null>(
    null,
  );

  const [showEditModal, setShowEditModal] = useState(false);

  const [form, setForm] = useState({
    region: "",
    area: 0,
    unit: "",
    coveredArea: 0,
    constructionType: "complete" as "complete" | "grey_structure",
    mode: "with_material" as "with_material" | "without_material",
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [calculations, regionData] = await Promise.all([
        getPopularCalculations(),
        getEstimatorRegions(),
      ]);

      setItems(calculations);
      setRegions(regionData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    try {
        const range = ranges[form.unit];

if (!range) {
  alert("Please select unit");
  return;
}

if (
  form.area < range.min ||
  form.area > range.max
) {
  alert(range.message);
  return;
}
let coveredArea =
  Number(form.coveredArea);

const totalAreaSqFt =
  convertToSqFt(
    Number(form.area),
    form.unit
  );

if (!coveredArea) {
  coveredArea = totalAreaSqFt;
}

if (coveredArea > totalAreaSqFt) {
  alert(
    "Covered Area cannot be larger than Total Area"
  );
  return;
}
      await createPopularCalculation({
  ...form,
  coveredArea,
});

      setForm({
        region: "",
        area: 0,
        unit: "",
        coveredArea: 0,
        constructionType: "complete",
        mode: "with_material",
        isActive: true,
      });

      await loadData();

      alert("Popular calculation added");
    } catch (error) {
      console.error(error);
      alert("Failed to create");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this calculation?")) return;

    try {
      await deletePopularCalculation(id);

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await togglePopularCalculation(id);

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveUp = async (item: PopularCalculation) => {
    try {
      if (item.displayOrder <= 1) return;

      await reorderPopularCalculation(item._id, item.displayOrder - 1);
      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMoveDown = async (item: PopularCalculation) => {
    try {
      await reorderPopularCalculation(item._id, item.displayOrder + 1);

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (item: PopularCalculation) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updatePopularCalculation(editingItem._id, editingItem);

      setShowEditModal(false);

      await loadData();
    } catch (error) {
      console.error(error);
    }
  };

  type Range = {
  min: number;
  max: number;
  message: string;
};

const ranges: Record<string, Range> = {
  Marla: {
    min: 2,
    max: 1999,
    message:
      "Valid range is 2 Marla - 1999 Marla",
  },

  Kanal: {
    min: 0.15,
    max: 99.95,
    message:
      "Valid range is 0.15 Kanal - 99.95 Kanal",
  },

  Sqft: {
    min: 675,
    max: 449775,
    message:
      "Valid range is 675 Sqft - 449775 Sqft",
  },

  Sqyard: {
    min: 75,
    max: 49975,
    message:
      "Valid range is 75 Sqyd - 49975 Sqyd",
  },

  Sqmeter: {
    min: 63,
    max: 41979,
    message:
      "Valid range is 63 Sqm - 41979 Sqm",
  },

  Acre: {
    min: 0.02,
    max: 12.49,
    message:
      "Valid range is 0.02 Acre - 12.49 Acre",
  },
};
const convertToSqFt = (
  area: number,
  unit: string
) => {
  switch (unit) {
    case "Marla":
      return area * 225;

    case "Kanal":
      return area * 4500;

    case "Sqyard":
      return area * 9;

    case "Sqmeter":
      return area * 10.7639;

    case "Acre":
      return area * 43560;

    default:
      return area;
  }
};

  return (
   <div className="space-y-6">

  {/* Header */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
          Estimator
        </p>

        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          Popular Calculations
        </h1>

        <p className="text-sm text-gray-600 mt-2">
          Manage predefined construction cost calculations shown on the client side.
        </p>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">
          Total Calculations
        </p>

        <p className="text-2xl font-bold text-gray-900 mt-1">
          {items.length}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">
          Active
        </p>

        <p className="text-2xl font-bold text-emerald-600 mt-1">
          {
            items.filter(
              (x) => x.isActive
            ).length
          }
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">
          Inactive
        </p>

        <p className="text-2xl font-bold text-red-600 mt-1">
          {
            items.filter(
              (x) => !x.isActive
            ).length
          }
        </p>
      </div>

    </div>
  </div>

  {/* Create Form */}
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900">
        Add Popular Calculation
      </h2>

      <p className="text-sm text-gray-600 mt-1">
        Create cards that users can click directly from the estimator page.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Region */}
      <select
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={form.region}
        onChange={(e) =>
          setForm({
            ...form,
            region: e.target.value,
          })
        }
      >
        <option value="">
          Select Region
        </option>

        {regions.map((region) => (
          <option
            key={region._id}
            value={region.name}
          >
            {region.name}
          </option>
        ))}
      </select>

      {/* Area */}
      <input
        type="number"
        placeholder="Area"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={form.area || ""}
        onChange={(e) =>
          setForm({
            ...form,
            area: Number(
              e.target.value
            ),
          })
        }
      />

      {/* Unit */}
      <select
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={form.unit}
        onChange={(e) =>
          setForm({
            ...form,
            unit: e.target.value,
          })
        }
      >
        <option value="">
          Select Unit
        </option>

        <option value="Marla">
          Marla
        </option>

        <option value="Kanal">
          Kanal
        </option>

        <option value="Sqft">
          Square Feet
        </option>

        <option value="Sqyard">
          Square Yard
        </option>

        <option value="Sqmeter">
          Square Meter
        </option>

        <option value="Acre">
          Acre
        </option>
      </select>

      {/* Covered Area */}
      <div>
        <input
          type="number"
          placeholder="Covered Area (Sq Ft)"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={form.coveredArea || ""}
          onChange={(e) =>
            setForm({
              ...form,
              coveredArea: Number(
                e.target.value
              ),
            })
          }
        />

        <p className="text-xs text-gray-500 mt-2">
          Leave empty to use total area automatically.
        </p>
      </div>

      {/* Construction Type */}
      <select
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={form.constructionType}
        onChange={(e) =>
          setForm({
            ...form,
            constructionType:
              e.target.value as any,
          })
        }
      >
        <option value="complete">
          Complete House
        </option>

        <option value="grey_structure">
          Grey Structure
        </option>
      </select>

      {/* Mode */}
      <select
        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        value={form.mode}
        onChange={(e) =>
          setForm({
            ...form,
            mode:
              e.target.value as any,
          })
        }
      >
        <option value="with_material">
          With Material
        </option>

        <option value="without_material">
          Without Material
        </option>
      </select>

    </div>

    <div className="mt-6">
      <button
        onClick={handleCreate}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
      >
        Add Popular Calculation
      </button>
    </div>

  </div>
  {/* Table */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
    <h2 className="text-lg font-semibold text-gray-900">
      Existing Calculations
    </h2>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Area
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Region
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Type
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Mode
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Covered Area
          </th>

          

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Status
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
            Actions
          </th>

        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td
              colSpan={8}
              className="px-6 py-12 text-center text-gray-500"
            >
              Loading calculations...
            </td>
          </tr>
        ) : (
          items.map((item) => (
            <tr
              key={item._id}
              className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
            >

              <td className="px-6 py-4 font-medium text-gray-900">
                {item.area} {item.unit}
              </td>

              <td className="px-6 py-4 text-gray-700">
                {item.region}
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {item.constructionType === "complete"
                    ? "Complete House"
                    : "Grey Structure"}
                </span>
              </td>

              <td className="px-6 py-4">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  {item.mode === "with_material"
                    ? "With Material"
                    : "Without Material"}
                </span>
              </td>

              <td className="px-6 py-4 text-gray-700">
                {item.coveredArea.toLocaleString()} Sq Ft
              </td>

             

              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleToggle(item._id)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      item.isActive
                        ? "border border-amber-200 bg-amber-50 text-amber-700"
                        : "border border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {item.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  <button
                    onClick={() =>
                      handleMoveUp(item)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-medium transition"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() =>
                      handleMoveDown(item)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs font-medium transition"
                  >
                    ↓
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(item._id)
                    }
                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition"
                  >
                    Delete
                  </button>

                </div>
              </td>

            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

</div>

{/* Edit Modal */}
{showEditModal && editingItem && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">

    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 w-[700px] max-w-[95vw]">

      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Edit Popular Calculation
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

  <select
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.region}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        region: e.target.value,
      })
    }
  >
    {regions.map((region) => (
      <option
        key={region._id}
        value={region.name}
      >
        {region.name}
      </option>
    ))}
  </select>

  <input
    type="number"
    placeholder="Area"
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.area}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        area: Number(e.target.value),
      })
    }
  />

  <select
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.unit}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        unit: e.target.value,
      })
    }
  >
    <option value="Marla">Marla</option>
    <option value="Kanal">Kanal</option>
    <option value="Sqft">Square Feet</option>
    <option value="Sqyard">Square Yard</option>
    <option value="Sqmeter">Square Meter</option>
    <option value="Acre">Acre</option>
  </select>

  <input
    type="number"
    placeholder="Covered Area"
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.coveredArea}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        coveredArea: Number(e.target.value),
      })
    }
  />

  <select
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.constructionType}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        constructionType:
          e.target.value as
            | "complete"
            | "grey_structure",
      })
    }
  >
    <option value="complete">
      Complete House
    </option>

    <option value="grey_structure">
      Grey Structure
    </option>
  </select>

  <select
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
    value={editingItem.mode}
    onChange={(e) =>
      setEditingItem({
        ...editingItem,
        mode: e.target.value as
          | "with_material"
          | "without_material",
      })
    }
  >
    <option value="with_material">
      With Material
    </option>

    <option value="without_material">
      Without Material
    </option>
  </select>

  <div className="md:col-span-2">
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={editingItem.isActive}
        onChange={(e) =>
          setEditingItem({
            ...editingItem,
            isActive: e.target.checked,
          })
        }
      />

      <span className="text-sm text-gray-700">
        Active
      </span>
    </label>
  </div>

</div>

      <div className="flex justify-end gap-3 mt-6">

        <button
          onClick={() =>
            setShowEditModal(false)
          }
          className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition"
        >
          Save Changes
        </button>

      </div>

    </div>

  </div>
)}

</div>
);
};

export default EstimatorPopularCalculations;