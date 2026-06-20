import React, { useEffect, useMemo, useState } from "react";
import ErrorAlert from "@shared/components/ErrorAlert";
import {
  createEstimatorRegion,
  deleteEstimatorRegion,
  getEstimatorRegions,
  updateEstimatorRegion,
  type EstimatorRegion,
  type RegionRates} from "../../api/estimator.api";

type RegionFormState = {
  name: string;
  notes: string;
  grey_with_material: string;
  grey_without_material: string;
  complete_with_material: string;
  complete_without_material: string;
};

const emptyForm: RegionFormState = {
  name: "",
  notes: "",
  grey_with_material: "",
  grey_without_material: "",
  complete_with_material: "",
  complete_without_material: "",
};

const toNumber = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const EstimatorRegions: React.FC = () => {
  const [regions, setRegions] = useState<EstimatorRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<EstimatorRegion | null>(null);
  const [form, setForm] = useState<RegionFormState>(emptyForm);

  const loadRegions = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getEstimatorRegions();
      setRegions(data);
    } catch (error) {
      setErrorMessage("Failed to load estimator regions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRegions();
  }, []);

  const openCreate = () => {
    setEditingRegion(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (region: EstimatorRegion) => {
    setEditingRegion(region);
    setForm({
      name: region.name || "",
      notes: region.notes || "",
      grey_with_material: String(region.rates?.grey_with_material ?? ""),
      grey_without_material: String(region.rates?.grey_without_material ?? ""),
      complete_with_material: String(region.rates?.complete_with_material ?? ""),
      complete_without_material: String(region.rates?.complete_without_material ?? ""),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRegion(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      notes: form.notes.trim(),
      rates: {
        grey_with_material: toNumber(form.grey_with_material),
        grey_without_material: toNumber(form.grey_without_material),
        complete_with_material: toNumber(form.complete_with_material),
        complete_without_material: toNumber(form.complete_without_material),
      } satisfies RegionRates,
    };

    try {
      setSaving(true);
      setErrorMessage(null);

      if (editingRegion) {
        await updateEstimatorRegion(editingRegion._id, payload);
      } else {
        await createEstimatorRegion(payload);
      }

      closeModal();
      await loadRegions();
    } catch (error) {
      setErrorMessage("Failed to save region.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (region: EstimatorRegion) => {
    const ok = window.confirm(`Delete region "${region.name}"?`);
    if (!ok) return;

    try {
      await deleteEstimatorRegion(region._id);
      await loadRegions();
    } catch (error) {
      setErrorMessage("Failed to delete region.");
    }
  };

  const totals = useMemo(
    () => ({
      regions: regions.length,
    }),
    [regions]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              Estimator
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">Region Rates</h1>
            <p className="text-sm text-gray-600 mt-2">
              Add and edit Islamabad / Rawalpindi rates.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Add Region
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4">
            <ErrorAlert
              type="error"
              title="Estimator Error"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Total Regions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.regions}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading regions...</div>
        ) : regions.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No regions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Region</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Grey + Material</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Grey + Without</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Complete + Material</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Complete + Without</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region) => (
                  <tr key={region._id} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{region.name}</td>
                    <td className="px-4 py-3">{region.rates.grey_with_material.toLocaleString()}</td>
                    <td className="px-4 py-3">{region.rates.grey_without_material.toLocaleString()}</td>
                    <td className="px-4 py-3">{region.rates.complete_with_material.toLocaleString()}</td>
                    <td className="px-4 py-3">{region.rates.complete_without_material.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(region)}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(region)}
                          className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRegion ? "Edit Region" : "Add Region"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage estimator rates for a city/region.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Region Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Islamabad"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grey Structure + With Material
                </label>
                <input
                  type="number"
                  value={form.grey_with_material}
                  onChange={(e) =>
                    setForm({ ...form, grey_with_material: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grey Structure + Without Material
                </label>
                <input
                  type="number"
                  value={form.grey_without_material}
                  onChange={(e) =>
                    setForm({ ...form, grey_without_material: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete House + With Material
                </label>
                <input
                  type="number"
                  value={form.complete_with_material}
                  onChange={(e) =>
                    setForm({ ...form, complete_with_material: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete House + Without Material
                </label>
                <input
                  type="number"
                  value={form.complete_without_material}
                  onChange={(e) =>
                    setForm({ ...form, complete_without_material: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingRegion ? "Update Region" : "Create Region"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatorRegions;