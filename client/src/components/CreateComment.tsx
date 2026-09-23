import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/userStore";

interface CreateCommentProps {
  postId: number;
  onSubmit: (commentText: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function CreateComment({
  onSubmit,
  isSubmitting = false,
}: CreateCommentProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setError(null);
      await onSubmit(trimmed);
      setContent("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post comment. Please try again.");
      }
    }
  };

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center text-sm text-slate-400">
        <Link to="/login" className="font-medium text-indigo-400 hover:underline">
          Log in
        </Link>{" "}
        to join the discussion.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex gap-3">
        <div className="shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.userName}
              className="h-9 w-9 rounded-full border border-slate-700 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold uppercase text-indigo-400">
              {user.userName?.charAt(0) || "?"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />

          {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}

          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {content.length > 0 && `${content.length} characters`}
            </span>

            <button
              type="submit"
              disabled={!content.trim() || isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Posting...
                </>
              ) : (
                "Comment"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}