
import { Link, useNavigate } from "react-router-dom";
import { postServices } from "../services/postService";
import { useUserStore } from "../stores/userStore";
import type { PaginationResult, PostRes } from "../types/PostTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";



interface PostCardProps {
  post: PostRes;
  leaveComment: () => void;
}

export default function PostCard({ post, leaveComment }: PostCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate()

  const user = useUserStore((state) => state.user);

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });


  const deletePostMutation = useMutation({
    mutationFn: (id: number) => postServices.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("Failed to delete post:", error);
    },
  });

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  const fullPostImageUrl = post.imageUrl
    ? `${baseUrl}/${post.imageUrl.replace(/^\//, "")}`
    : undefined;

  const fullAvatarUrl = post.userProfileImageUrl
    ? `${baseUrl}/${post.userProfileImageUrl.replace(/^\//, "")}`
    : undefined;

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(post.id);
    }
  };

  const likeMutation = useMutation({
    mutationFn: () => postServices.likePost(post.id),
    onSuccess: (data) => {
      queryClient.setQueriesData<PaginationResult<PostRes>>(
        { queryKey: ['posts'] },
        (old): PaginationResult<PostRes> | undefined => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((p: PostRes): PostRes =>
              p.id === data.postId
                ? { ...p, isLikedByCurrentUser: data.isLiked, likeCount: data.likeCount }
                : p
            ),
          };
        }
      );
    },
  });
  
  const handleCardClick = () => {
    navigate(`/post/${post.id}`)
  }
  
  return (
    <article onClick={handleCardClick} className="w-full border-b border-slate-800 bg-slate-900/40 p-5 transition-colors hover:bg-slate-900/70 cursor-pointer">
      <div className="mb-3 flex items-center justify-between ">
        <Link
          to="/user"
          onClick={(e) => e.stopPropagation()}
          className="group flex items-center gap-3"
        >
          {fullAvatarUrl ? (
            <img
              src={fullAvatarUrl}
              alt={post.username}
              className="h-10 w-10 shrink-0 rounded-full border border-slate-700 object-cover ring-2 ring-transparent transition group-hover:border-indigo-500 group-hover:ring-indigo-500/20"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-semibold uppercase text-indigo-400 ring-2 ring-transparent transition group-hover:border-indigo-500 group-hover:ring-indigo-500/20">
              {post.username?.charAt(0) || '?'}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
            <span className="text-sm font-semibold text-slate-100 transition group-hover:text-indigo-400">
              {post.username}
            </span>
            <span className="text-sm text-slate-500">
              {formattedDate}
            </span>
          </div>
        </Link>

        {(user?.id === post.userId || user?.isAdmin) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={deletePostMutation.isPending}
            className="rounded-lg border border-red-500/20 bg-red-950/30 px-3 py-1 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:bg-red-900/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>

      <p className="mb-3 cursor-text whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
        {post.content}
      </p>

      {fullPostImageUrl && (
        <div className="mt-3 flex justify-center overflow-hidden rounded-2xl border border-slate-800 bg-black/40">
          <img
            src={fullPostImageUrl}
            alt="Post attachment"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="max-h-[650px] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      )}

      <div className="mt-4 flex items-center gap-6 border-t border-slate-800/60 pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            likeMutation.mutate();
          }}
          disabled={likeMutation.isPending}
          className={`group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer transition ${
            post.isLikedByCurrentUser
              ? 'text-rose-500 hover:bg-rose-500/10'
              : 'text-slate-400 hover:bg-slate-800 hover:text-rose-400'
          }`}
        >
          <svg
            className="h-4 w-4 transition group-hover:scale-110"
            viewBox="0 0 24 24"
            fill={post.isLikedByCurrentUser ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
          <span>{post.likeCount}</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            leaveComment()
          }}
          className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
        >
          <svg
            className="h-4 w-4 transition group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-.785-.175.75.75 0 0 1-.168-.804l.794-2.383C3.65 16.147 3 14.167 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
          <span>{post.commentCount}</span>
        </button>
      </div>
    </article>
  );
}