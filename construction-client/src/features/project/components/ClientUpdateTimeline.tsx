import React from "react";
import type { Attachment, ProjectUpdate } from "@features/admin";
import ClientUpdateCard from "./ClientUpdateCard";

interface ClientUpdateTimelineProps {
  updates: ProjectUpdate[];
  isLoading?: boolean;
  onOpenImage?: (attachment: Attachment) => void;
  clientName?: string;
  onReply?: (updateId: string, message: string, parentReplyId?: string) => void;
}

const ClientUpdateTimeline: React.FC<ClientUpdateTimelineProps> = ({ updates, isLoading = false, onOpenImage, clientName, onReply }) => {
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
        <p className="text-gray-400 text-xs">Updates will appear here once your project timeline starts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <ClientUpdateCard
          key={update.id}
          update={update}
          onOpenImage={onOpenImage}
          clientName={clientName}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default ClientUpdateTimeline;
