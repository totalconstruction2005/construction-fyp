import React, { useMemo, useState } from "react";
import type { Attachment, ProjectReply, ProjectUpdate } from "../types";

interface UpdateCardProps {
  update: ProjectUpdate;
  onOpenImage?: (attachment: Attachment) => void;
  clientName?: string;
  onReply?: (updateId: string, message: string, parentReplyId?: string) => void;
  onEditUpdate?: (update: ProjectUpdate) => void;
  onDeleteUpdate?: (updateId: string) => void;
}

type ReplyTarget = { type: "update" | "reply"; parentReplyId?: string } | null;

const UpdateCard: React.FC<UpdateCardProps> = ({ update, onOpenImage, clientName, onReply, onEditUpdate, onDeleteUpdate }) => {
  const [replyingTo, setReplyingTo] = useState<ReplyTarget>(null);
  const [replyText, setReplyText] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      setDownloadingId(attachment.id);
      const url = attachment.url || attachment.data;
      const response = await fetch(url);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error: any) {
      console.error("Download failed:", error);
      const message = error?.message || "Download failed. Opening file in new tab...";
      console.warn(message);
      // Fallback: open in new tab
      window.open(attachment.url || attachment.data, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const replies = useMemo(() => update.replies || [], [update.replies]);

  const topLevelReplies = useMemo(
    () => replies.filter((r) => !r.parentReplyId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [replies]
  );

  const childReplies = (parentId: string): ProjectReply[] =>
    replies
      .filter((r) => r.parentReplyId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const startReply = (target: ReplyTarget) => {
    setReplyingTo(target);
    setReplyText("");
  };

  const handleReplySubmit = () => {
    if (!onReply || !replyingTo) return;
    const message = replyText.trim();
    if (!message) return;
    onReply(update.id, message, replyingTo.parentReplyId);
    setReplyText("");
    setReplyingTo(null);
  };

  return (
    <div className="border-l-4 border-emerald-500 bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{update.title || "Admin Update"}</h3>
        <span className="text-xs text-gray-500 whitespace-nowrap ml-3">
          {formatDate(update.createdAt)}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4">{update.description}</p>

      {/* Attachments */}
      {update.attachments && update.attachments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Attachments ({update.attachments.length})</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {update.attachments.map((attachment) => (
              <div key={attachment.id} className="group relative bg-white rounded border border-gray-200 overflow-hidden">
                {attachment.type === "image" ? (
                  <div className="w-full">
                    <div
                      role="button"
                      onClick={() => onOpenImage && onOpenImage(attachment)}
                      className="block w-full"
                      title="View image"
                    >
                      <img
                        src={attachment.data}
                        alt={attachment.name}
                        className="w-full h-24 object-cover group-hover:brightness-95 transition"
                      />
                    </div>
                    <div className="px-2 py-1">
                      <p className="text-xs text-gray-700 truncate">🖼️ {attachment.name}</p>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 border-t bg-gray-50">
                      <button
                        type="button"
                        onClick={() => onOpenImage && onOpenImage(attachment)}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(attachment)}
                        disabled={downloadingId === attachment.id}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                      >
                        {downloadingId === attachment.id ? "Downloading..." : "Download"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 flex flex-col items-center justify-center h-24">
                    <p className="text-2xl mb-1">📄</p>
                    <p className="text-xs text-gray-700 truncate w-full text-center" title={attachment.name}>{attachment.name}</p>
                  </div>
                )}

                {/* Actions for non-image */}
                {attachment.type === "file" && (
                  <div className="flex items-center justify-between px-2 py-2 border-t bg-gray-50">
                    <a
                      href={attachment.url || attachment.data}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(attachment)}
                      disabled={downloadingId === attachment.id}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
                    >
                      {downloadingId === attachment.id ? "Downloading..." : "Download"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta + actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            update.createdBy === "admin" ? "bg-emerald-100" : "bg-blue-100"
          }`}>
            <span className={`text-xs font-semibold ${
              update.createdBy === "admin" ? "text-emerald-700" : "text-blue-700"
            }`}>
              {update.createdBy === "admin" ? "A" : "C"}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Posted by {update.createdBy === "admin" ? "Admin" : (clientName || "Client")}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(onEditUpdate || onDeleteUpdate) && (
            <>
              <button
                type="button"
                onClick={() => onEditUpdate && onEditUpdate(update)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteUpdate && onDeleteUpdate(update.id)}
                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Replies */}
      {topLevelReplies.length > 0 && (
        <div className="mt-5 space-y-3">
          {topLevelReplies.map((reply) => (
            <div key={reply.id} className="pl-3 border-l-2 border-emerald-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-emerald-700">{reply.createdBy === "client" ? "Client Reply" : "Admin Reply"}</p>
                  <p className="text-sm text-gray-800 mt-1">{reply.message}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{formatDate(reply.createdAt)}</p>
                </div>
                {onReply && (
                  <button
                    type="button"
                    onClick={() => startReply({ type: "reply", parentReplyId: reply.id })}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    Reply
                  </button>
                )}
              </div>

              {childReplies(reply.id).length > 0 && (
                <div className="mt-3 ml-3 space-y-2">
                  {childReplies(reply.id).map((child) => (
                    <div key={child.id} className="pl-3 border-l border-gray-200">
                      <p className="text-xs font-semibold text-gray-700">Admin Reply</p>
                      <p className="text-sm text-gray-800 mt-1">{child.message}</p>
                      <p className="text-[11px] text-gray-500 mt-1">{formatDate(child.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply composer */}
      {replyingTo && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-emerald-800">
            {replyingTo.parentReplyId ? "Replying to Client" : "Replying to Update"}
          </p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className="w-full text-sm border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="Write your reply..."
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setReplyText("");
              }}
              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReplySubmit}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCard;
