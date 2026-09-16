import { Link } from "react-router-dom";
import type { CommentRes } from "../types/PostTypes";

interface CommentCardProps {
  comment: CommentRes;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const formattedDate = new Date(comment.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const fullAvatarUrl = comment.userImageUrl
    ? `${baseUrl}/${comment.userImageUrl.replace(/^\//, "")}`
    : undefined;

  return (
    <div className="flex gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 transition-colors hover:bg-slate-900/60">
      <Link to={`/user/${comment.userId}`} className="shrink-0">
        {fullAvatarUrl ? (
          <img
            src={fullAvatarUrl}
            alt={comment.username}
            className="h-9 w-9 rounded-full border border-slate-700 object-cover transition hover:border-indigo-500"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold uppercase text-indigo-400">
            {comment.username?.charAt(0) || "?"}
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            to={`/user/${comment.userId}`}
            className="truncate text-xs font-semibold text-slate-200 transition hover:text-indigo-400"
          >
            {comment.username}
          </Link>
          <span className="text-[11px] text-slate-500">{formattedDate}</span>
        </div>

        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {comment.comment}
        </p>
      </div>
    </div>
  );
}