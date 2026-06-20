import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FloorPlan, FloorPlanFormData } from "../types/floorPlan.types";

interface FloorPlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FloorPlanFormData) => Promise<void>;
  editingFloorPlan?: FloorPlan | null;
  isSaving?: boolean;
}

const FloorPlanFormModal = ({ isOpen, onClose, onSubmit, editingFloorPlan, isSaving = false }: FloorPlanFormModalProps) => {
  const [formData, setFormData] = useState<FloorPlanFormData>({
    title: "",
    marlaSize: 5,
    category: "residential",
    rooms: 3,
    washrooms: 2,
    imageFile: null,
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set form data when editing
  useEffect(() => {
    if (editingFloorPlan) {
      setFormData({
        title: editingFloorPlan.title,
        marlaSize: editingFloorPlan.marlaSize,
        category: editingFloorPlan.category,
        rooms: editingFloorPlan.rooms,
        washrooms: editingFloorPlan.washrooms,
        imageFile: null,
        isActive: editingFloorPlan.isActive,
      });
      setImagePreview(editingFloorPlan.image.secure_url);
    } else {
      setFormData({
        title: "",
        marlaSize: 5,
        category: "residential",
        rooms: 3,
        washrooms: 2,
        imageFile: null,
        isActive: true,
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [editingFloorPlan]);

  if (!isOpen) return null;

  const isEditMode = !!editingFloorPlan;

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please select an image file" }));
        return;
      }

      setFormData((prev) => ({ ...prev, imageFile: file }));
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Clear error
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.marlaSize <= 0) {
      newErrors.marlaSize = "Marla size must be greater than 0";
    }

    if (formData.rooms <= 0) {
      newErrors.rooms = "Rooms must be greater than 0";
    }

    if (formData.washrooms <= 0) {
      newErrors.washrooms = "Washrooms must be greater than 0";
    }

    // Image is required only when adding new floor plan
    if (!isEditMode && !formData.imageFile) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      // Error is handled in parent component
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    // Clean up preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Reset form
    setFormData({
      title: "",
      marlaSize: 5,
      category: "residential",
      rooms: 3,
      washrooms: 2,
      imageFile: null,
      isActive: true,
    });
    setImagePreview(null);
    setErrors({});
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">
              {isEditMode ? "Edit Template" : "New Template"}
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-0.5">
              {isEditMode ? "Edit Floor Plan" : "Add Floor Plan"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-400 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Modern 5 Marla House"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Marla Size & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marla Size *
                </label>
                <input
                  type="number"
                  name="marlaSize"
                  value={formData.marlaSize}
                  onChange={handleInputChange}
                  min="1"
                  step="0.5"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-400 ${
                    errors.marlaSize ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.marlaSize && (
                  <p className="text-red-500 text-xs mt-1">{errors.marlaSize}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            {/* Rooms & Washrooms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rooms *
                </label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-400 ${
                    errors.rooms ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.rooms && (
                  <p className="text-red-500 text-xs mt-1">{errors.rooms}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Washrooms *
                </label>
                <input
                  type="number"
                  name="washrooms"
                  value={formData.washrooms}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition placeholder-gray-400 ${
                    errors.washrooms ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.washrooms && (
                  <p className="text-red-500 text-xs mt-1">{errors.washrooms}</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Floor Plan Image {!isEditMode && "*"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${
                  errors.image ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
              {isEditMode && !formData.imageFile && (
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
              )}

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Active (visible to users)
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditMode ? "Update Floor Plan" : "Add Floor Plan"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorPlanFormModal;
