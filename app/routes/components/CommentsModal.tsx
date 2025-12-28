import React from "react";
import Modal from "./Modal";
import type { Comment } from "../types";

type Props = {
  open: boolean;
  onClose: () => void;

  cardTitle: string;
  comments: Comment[];

  newCommentText: string;
  onChangeNewCommentText: (v: string) => void;

  onAddComment: () => void;
  canSubmit: boolean;

  formatTimestamp: (ts: number) => string;
};

export default function CommentsModal({
  open,
  onClose,
  cardTitle,
  comments,
  newCommentText,
  onChangeNewCommentText,
  onAddComment,
  canSubmit,
  formatTimestamp,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Comments for "${cardTitle}"`}
      footer={
        <button
          type="button"
          onClick={onAddComment}
          disabled={!canSubmit}
          className="w-max h-7 cursor-pointer px-4 text-sm bg-green-400 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Comment
        </button>
      }
    >
      {comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-50 border border-gray-200 rounded-md p-2"
            >
              <p className="text-xs text-gray-600 mb-1">
                {c.author} · {formatTimestamp(c.createdAt)}
              </p>
              <p className="text-sm whitespace-pre-wrap">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={newCommentText}
        onChange={(e) => onChangeNewCommentText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onAddComment();
          }
        }}
        className="placeholder:text-sm mb-2 w-full outline-0 mt-5 border border-gray-300 rounded-md p-1"
        placeholder="Write a comment ... (Enter to send, Shift+Enter for new line)"
      />
    </Modal>
  );
}
