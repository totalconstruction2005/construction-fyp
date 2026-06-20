import React, { useState, useRef } from "react";
import type { ProjectUpdate, Attachment } from "../types";

interface UpdateFormProps {
  projectId: string;
  onSubmit: (update: Omit<ProjectUpdate, "id" | "createdAt" | "createdBy">) => void;
  isSubmitting?: boolean;
}

const UpdateForm: React.FC<UpdateFormProps> = ({ projectId, onSubmit, isSubmitting = false }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getAttachmentType = (file: File): "image" | "file" => {
    return file.type.startsWith("image/") ? "image" : "file";
  };

  const handleFileSelect = async (files: FileList) => {
    try {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = await fileToBase64(file);
        const type = getAttachmentType(file);

        newAttachments.push({
          id: `attach-${Date.now()}-${i}`,
          name: file.name,
          type,
          data,
          uploadedAt: new Date().toISOString(),
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error: any) {
      console.error("Error reading file:", error);
      const message = error?.message || "Failed to upload file. Please try again.";
      alert(message);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill in both title and description");
      return;
    }

    onSubmit({
      projectId,
      title: title.trim(),
      description: description.trim(),
      attachments,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setAttachments([]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Update Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Foundation work completed"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed information about this update..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Attachments (Images & Files)
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            isDragging
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files);
              }
            }}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            disabled={isSubmitting}
          />

          <div className="mb-3">
            <p className="text-3xl mb-2">📁</p>
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Drag files here or click to browse
            </p>
            <p className="text-xs text-gray-600">
              Supported: Images, PDF, Word, Excel
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting}
            className="mt-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg text-sm transition disabled:opacity-50"
          >
            Choose Files
          </button>
        </div>
      </div>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Attached Files ({attachments.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative group bg-white rounded border border-gray-200 overflow-hidden"
              >
                {attachment.type === "image" ? (
                  <img
                    src={attachment.data}
                    alt={attachment.name}
                    className="w-full h-20 object-cover"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                    <p className="text-lg">📄</p>
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={isSubmitting}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm disabled:opacity-50"
                >
                  ✕
                </button>

                {/* Filename tooltip */}
                <div className="p-1 text-center">
                  <p className="text-xs text-gray-600 truncate" title={attachment.name}>
                    {attachment.name.length > 12
                      ? attachment.name.substring(0, 10) + "..."
                      : attachment.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold rounded-lg text-sm transition"
        >
          {isSubmitting ? "Publishing..." : "Publish Update"}
        </button>
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setDescription("");
            setAttachments([]);
          }}
          disabled={isSubmitting}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm transition"
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default UpdateForm;
