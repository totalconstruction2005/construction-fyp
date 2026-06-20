import React, { useEffect } from "react";
import type { Attachment } from "../types";

interface AttachmentViewerProps {
  open: boolean;
  attachment?: Attachment;
  onClose: () => void;
}

const AttachmentViewer: React.FC<AttachmentViewerProps> = ({ open, attachment, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !attachment || attachment.type !== "image") return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4 flex gap-2">
        <a
          href={attachment.url || attachment.data}
          download={attachment.name}
          className="px-3 py-2 bg-white/90 hover:bg-white rounded-md text-gray-800 shadow"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </a>
        <button className="px-3 py-2 bg-white/90 hover:bg-white rounded-md text-gray-800 shadow" onClick={onClose}>Close ✕</button>
      </div>
      <div className="w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={attachment.data}
          alt={attachment.name}
          className="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded"
        />
      </div>
    </div>
  );
};

export default AttachmentViewer;
