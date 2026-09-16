import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { postServices } from "../../services/postService";
// import { useUserStore } from "../../stores/userStore";
import type { PostRes, CommentReq, PaginationResult, CommentRes } from "../../types/PostTypes";
import CommentModal from "../../components/CommentModal";
import PaginationFooter from "../../components/PaginationFooter";
import PostCard from "../../components/PostCard";

export default function PostDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activePostId, setActivePostId] = useState<number | null>(null);

  const pageNumber = Number(searchParams.get('pageNumber')) || 1;
  const pageSize = 2 ;

  const { data: comments } = useSuspenseQuery<PaginationResult<CommentRes>>({
    queryKey: ['postComments', pageNumber, pageSize],
    queryFn: () => postServices.getPostComments(postId, pageNumber, pageSize),
  });

  const setPage = (newPage: number) => {
    searchParams.set('pageNumber', String(newPage));
    setSearchParams(searchParams);
  };

  const {
    data: post,
  } = useSuspenseQuery<PostRes>({
    queryKey: ["post", postId],
    queryFn: () => postServices.getPost(postId),
  });


  const commentMutation = useMutation({
      mutationFn: (comment: CommentReq) => postServices.leaveComment(comment),
      onSuccess: (data) => {
        queryClient.setQueriesData<PaginationResult<PostRes>>(
            { queryKey: ['posts'] },
            (old) => {
            if (!old) return old;
            return {
                ...old,
                items: old.items.map((p) =>
                p.id === data.postId
                    ? { ...p, commentCount: (p.commentCount ?? 0) + 1 }
                    : p
                ),
            };
            }
        );
      },
      onError: (error) => {
      console.error('Failed to post comment:', error);
      },
  });
  // const commentMutation = useMutation({
  //   mutationFn: (comment: CommentReq) => postServices.leaveComment(comment),
  //   onSuccess: () => {
  //     queryClient.setQueryData<PostRes>(["post", postId], (old) => {
  //       if (!old) return old;
  //       return {
  //         ...old,
  //         commentCount: (old.commentCount ?? 0) + 1,
  //       };
  //     });
  //     queryClient.invalidateQueries({ queryKey: ["posts"] });
  //     queryClient.invalidateQueries({ queryKey: ["postComments", postId] });
  //   },
  // });

  if (isNaN(postId)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Invalid post ID.
      </div>
    );
  }

 return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        
        <div className="sticky top-16 z-20 -mx-4 mb-4 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-xl sm:border sm:px-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <span className="text-sm font-medium text-slate-400">Post Thread</span>
        </div>

        <PostCard key={post.id} post={post} leaveComment={() => setActivePostId(post.id)}/>

        {/* <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
          <form onSubmit={handleInlineCommentSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={inlineComment}
              onChange={(e) => setInlineComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!inlineComment.trim() || commentMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentMutation.isPending ? "Posting..." : "Comment"}
              </button>
            </div>
          </form>
        </section> */}

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Comments ({post.commentCount})
          </h3>

          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            Comments will be rendered here.
          </div>

          {/* Pagination Footer */}
          <PaginationFooter
            pageNumber={pageNumber}
            totalPages={comments.totalPages}
            hasPreviousPage={comments.hasPreviousPage}
            hasNextPage={comments.hasNextPage}
            onPageChange={setPage}
          />
        </section>

        {activePostId && (
          <CommentModal 
              isOpen={true}
              onClose={() => setActivePostId(null)}
              isSubmitting={commentMutation.isPending}
              post={post}
              onSubmit={ async (commentText: string) => {
              await commentMutation.mutateAsync({
                  postId: activePostId,
                  comment: commentText, 
              });
              }}
            />
          )}

        {/* {isCommentModalOpen && (
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
        )} */}
      </div>
    </div>
  );
}