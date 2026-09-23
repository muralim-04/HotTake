import axios from 'axios';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => Promise<void> | void;
  isSubmitting?: boolean;
  post: {
    username: string;
    content: string;
    userProfileImageUrl?: string | null;
    createdAt?: string;
  };
}

export default function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  post,
}: CommentModalProps) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;
    try{
      await onSubmit(comment.trim());
      setComment('');
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : '';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-200">Reply to Post</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              {post.userProfileImageUrl ? (
                <img
                  src={post.userProfileImageUrl}
                  alt={post.username}
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-700 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold uppercase text-indigo-400">
                  {post.username?.charAt(0) || '?'}
                </div>
              )}
              <div className="my-1 w-0.5 grow bg-slate-800" />
            </div>

            <div className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  {post.username}
                </span>
                {formattedDate && (
                  <span className="text-sm text-slate-500">{formattedDate}</span>
                )}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                {post.content}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-2">
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Post your reply..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-sm text-slate-100 placeholder-slate-500 shadow-inner outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!comment.trim() || isSubmitting}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Replying...' : 'Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}