import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { postServices } from "../../services/postService";
import type { PostRes, CommentReq, PaginationResult, CommentRes } from "../../types/PostTypes";
import CommentModal from "../../components/CommentModal";
import PaginationFooter from "../../components/PaginationFooter";
import PostCard from "../../components/PostCard";
import CommentCard from "../../components/CommentCard";
import CreateComment from "../../components/CreateComment";

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
    queryKey: ['postComments', postId, pageNumber, pageSize],
    queryFn: () => postServices.getPostComments(postId, pageNumber, pageSize),
  });

  const setPage = (newPage: number) => {
    searchParams.set('pageNumber', String(newPage));
    setSearchParams(searchParams);
  };

  const { data: post } = useSuspenseQuery<PostRes>({
    queryKey: ["post", postId],
    queryFn: () => postServices.getPost(postId),
  });


  const commentMutation = useMutation({
      mutationFn: (comment: CommentReq) => postServices.leaveComment(comment),
      onSuccess: (data) => {
        queryClient.setQueryData<PostRes>(["post", postId], (old) => {
          if (!old) return old;
          return {
            ...old,
            commentCount: (old.commentCount ?? 0) + 1,
          };
        });

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

        queryClient.invalidateQueries({
          queryKey: ["postComments", postId],
        });
      },
      onError: (error) => {
      console.error('Failed to post comment:', error);
      },
  });

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

        <div className="mt-4">
          <CreateComment
            postId={post.id}
            isSubmitting={commentMutation.isPending}
            onSubmit={async (commentText) => {
              await commentMutation.mutateAsync({
                postId: post.id,
                comment: commentText,
              });
            }}
          />
        </div>

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Comments ({post.commentCount})
          </h3>

          {comments.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.items.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}

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
      </div>
    </div>
  );
}