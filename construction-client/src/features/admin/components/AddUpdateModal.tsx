import React, { useEffect, useRef, useState } from "react";
import type { Attachment, ProjectUpdate } from "../types";

interface AddUpdateModalProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onSubmit: (update: Omit<ProjectUpdate, "createdAt" | "createdBy" | "replies"> & { id?: string }) => void;
  initialUpdate?: ProjectUpdate | null;
  mode?: "create" | "edit";
}

const AddUpdateModal: React.FC<AddUpdateModalProps> = ({ open, projectId, onClose, onSubmit, initialUpdate, mode = "create" }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (initialUpdate) {
      setTitle(initialUpdate.title);
      setDescription(initialUpdate.description);
      setAttachments(initialUpdate.attachments || []);
    } else {
      setTitle("");
      setDescription("");
      setAttachments([]);
    }
  }, [initialUpdate, open]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getAttachmentType = (file: File): "image" | "file" => {
    return file.type.startsWith("image/") ? "image" : "file";
  };

  const handleFiles = async (files: FileList) => {
    const newItems: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const data = await fileToBase64(f);
      const type = getAttachmentType(f);
      const url = URL.createObjectURL(f);
      newItems.push({
        id: `attach-${Date.now()}-${i}`,
        name: f.name,
        type,
        data,
        url,
        uploadedAt: new Date().toISOString(),
      });
    }
    setAttachments((prev) => [...prev, ...newItems]);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const onBackdropClick = (e: React.MouseEvent) => {
    if (dialogRef.current && e.target instanceof Node && dialogRef.current === e.target) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please provide both title and description");
      return;
    }
    onSubmit({
      id: initialUpdate?.id || `update-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      attachments,
    });
    setTitle("");
    setDescription("");
    setAttachments([]);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div className="bg-white rounded-2xl shadow-lg w-[95%] max-w-2xl max-h-[90vh] flex flex-col min-h-0" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900">{mode === "edit" ? "Edit Project Update" : "Add Project Update"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 p-4 overflow-y-auto">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="e.g., Electrical wiring started"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide detailed information about this update..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Attachments</label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <p className="text-3xl mb-2">📁</p>
              <p className="text-sm font-semibold text-gray-900 mb-1">Drag files here or click to browse</p>
              <p className="text-xs text-gray-600">Images, PDF, Word, Excel, PowerPoint</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-lg text-sm"
              >
                Choose Files
              </button>
            </div>
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-3">Attached Files ({attachments.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {attachments.map((a) => (
                  <div key={a.id} className="relative group bg-white rounded border border-gray-200 overflow-hidden">
                    {a.type === "image" ? (
                      <img src={a.data} alt={a.name} className="w-full h-20 object-cover" />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                        <p className="text-lg">📄</p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(a.id)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ✕
                    </button>
                    <div className="p-1 text-center">
                      <p className="text-xs text-gray-600 truncate" title={a.name}>{a.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 p-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm">
              Publish Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateModal;
