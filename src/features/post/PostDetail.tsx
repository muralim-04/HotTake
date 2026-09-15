import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { postServices } from "../../services/postService";
import { useUserStore } from "../../stores/userStore";
import type { PostRes, CommentReq } from "../../types/PostTypes";
import CommentModal from "../../components/CommentModal";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useUserStore((state) => state.user);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = useSuspenseQuery<PostRes>({
    queryKey: ["post", postId],
    queryFn: () => postServices.getPost(postId),
  });

  const likeMutation = useMutation({
    mutationFn: () => postServices.likePost(postId),
    onSuccess: (data) => {
      queryClient.setQueryData<PostRes>(["post", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          isLikedByCurrentUser: data.isLiked,
          likeCount: data.likeCount,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (comment: CommentReq) => postServices.leaveComment(comment),
    onSuccess: () => {
      queryClient.setQueryData<PostRes>(["post", postId], (old) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: (old.commentCount ?? 0) + 1,
        };
      });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: () => postServices.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/");
    },
  });

  if (isNaN(postId)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Invalid post ID.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto mt-12 max-w-xl text-center">
        <p className="text-rose-400">
          {error instanceof Error ? error.message : "Failed to load post."}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-indigo-400 hover:underline"
        >
          ← Return to home
        </Link>
      </div>
    );
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  const fullPostImageUrl = post.imageUrl
    ? `${baseUrl}/${post.imageUrl.replace(/^\//, "")}`
    : undefined;
  const fullAvatarUrl = post.userProfileImageUrl
    ? `${baseUrl}/${post.userProfileImageUrl.replace(/^\//, "")}`
    : undefined;

  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition hover:text-slate-200"
        >
          ← Back
        </button>

        <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            <Link
              to={`/user/${post.userId}`}
              className="group flex items-center gap-3"
            >
              {fullAvatarUrl ? (
                <img
                  src={fullAvatarUrl}
                  alt={post.username}
                  className="h-12 w-12 shrink-0 rounded-full border border-slate-700 object-cover ring-2 ring-transparent transition group-hover:border-indigo-500"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-base font-semibold uppercase text-indigo-400">
                  {post.username?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <span className="text-base font-semibold text-slate-100 transition group-hover:text-indigo-400">
                  {post.username}
                </span>
                <p className="text-xs text-slate-500">{formattedDate}</p>
              </div>
            </Link>

            {(user?.id === post.userId || user?.isAdmin) && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePostMutation.isPending}
                className="rounded-lg border border-red-500/20 bg-red-950/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-900/40 disabled:opacity-50"
              >
                {deletePostMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>

          <p className="whitespace-pre-wrap text-base leading-relaxed text-slate-200">
            {post.content}
          </p>

          {fullPostImageUrl && (
            <div className="mt-4 flex justify-center overflow-hidden rounded-2xl border border-slate-800 bg-black/40">
              <img
                src={fullPostImageUrl}
                alt="Post attachment"
                className="max-h-[700px] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
          )}

          <div className="mt-6 flex items-center gap-6 border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                post.isLikedByCurrentUser
                  ? "text-rose-500 hover:bg-rose-500/10"
                  : "text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              }`}
            >
              <svg
                className="h-5 w-5 transition group-hover:scale-110"
                viewBox="0 0 24 24"
                fill={post.isLikedByCurrentUser ? "currentColor" : "none"}
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
              onClick={() => setIsCommentModalOpen(true)}
              className="group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
            >
              <svg
                className="h-5 w-5 transition group-hover:scale-110"
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

        {/* Comment Modal */}
        {isCommentModalOpen && (
          <CommentModal
            isOpen={isCommentModalOpen}
            onClose={() => setIsCommentModalOpen(false)}
            isSubmitting={commentMutation.isPending}
            post={post}
            onSubmit={async (commentText) => {
              await commentMutation.mutateAsync({
                postId: post.id,
                comment: commentText,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}