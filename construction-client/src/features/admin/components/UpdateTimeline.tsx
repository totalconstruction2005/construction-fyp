import React from "react";
import type { Attachment, ProjectUpdate } from "../types";
import UpdateCard from "./UpdateCard";

interface UpdateTimelineProps {
  updates: ProjectUpdate[];
  isLoading?: boolean;
  onOpenImage?: (attachment: Attachment) => void;
  clientName?: string;
  onReply?: (updateId: string, message: string, parentReplyId?: string) => void;
  onEditUpdate?: (update: ProjectUpdate) => void;
  onDeleteUpdate?: (updateId: string) => void;
}

const UpdateTimeline: React.FC<UpdateTimelineProps> = ({ updates, isLoading = false, onOpenImage, clientName, onReply, onEditUpdate, onDeleteUpdate }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="mb-4">
          <p className="text-4xl mb-3">📋</p>
        </div>
        <p className="text-gray-600 text-sm font-semibold mb-2">No Project Updates Yet</p>
        <p className="text-gray-400 text-xs">Start by adding your first project update to track progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <UpdateCard
          key={update.id}
          update={update}
          onOpenImage={onOpenImage}
          clientName={clientName}
          onReply={onReply}
          onEditUpdate={onEditUpdate}
          onDeleteUpdate={onDeleteUpdate}
        />
      ))}
    </div>
  );
};

export default UpdateTimeline;
