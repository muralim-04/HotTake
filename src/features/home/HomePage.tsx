import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { postServices } from "../../services/postService";
import type { CommentReq, PaginationResult, PostRes } from "../../types/PostTypes";
import { useSearchParams } from "react-router-dom";
import PostCard from "../../components/PostCard";
import CreatePost from "../../components/CreatePost";
import CommentModal from "../../components/CommentModal";
import { useState } from "react";


export default function HomePage () {
    const queryClient = useQueryClient(); 
    const [searchParams, setSearchParams] = useSearchParams();
    const [activePostId, setActivePostId] = useState<number | null>(null);

    const pageNumber = Number(searchParams.get('pageNumber')) || 1;
    const pageSize = 5;

    const { data: posts } = useSuspenseQuery<PaginationResult<PostRes>>({
        queryKey: ['posts', pageNumber, pageSize],
        queryFn: () => postServices.getAllPosts(pageNumber, pageSize),
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

    const setPage = (newPage: number) => {
        searchParams.set('pageNumber', String(newPage));
        setSearchParams(searchParams);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
            <main className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
                <CreatePost />

                <div className="divide-y divide-slate-800/80">
                {activePostId && (
                <CommentModal 
                    isOpen={true}
                    onClose={() => setActivePostId(null)}
                    isSubmitting={commentMutation.isPending}
                    post={posts.items.find((p) => p.id === activePostId)!}
                    onSubmit={(commentText: string) => {
                    commentMutation.mutateAsync({
                        postId: activePostId,
                        comment: commentText, 
                    });
                    }}
                />
                )}
                {posts.items.map((post) => (
                    <PostCard key={post.id} post={post} leaveComment={() => setActivePostId(post.id)}/>
                ))}
                </div>
            </main>

            <footer className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-3 text-sm text-slate-400">
                <button
                type="button"
                onClick={() => setPage(pageNumber - 1)}
                disabled={!posts.hasPreviousPage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
                </button>

                <span className="font-medium text-slate-300">
                Page <span className="font-semibold text-white">{posts.pageNumber}</span> of{' '}
                <span className="font-semibold text-white">{posts.totalPages}</span>
                </span>

                <button
                type="button"
                onClick={() => setPage(pageNumber + 1)}
                disabled={!posts.hasNextPage}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                Next
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                </button>
            </footer>
            </div>
        </div>
    );
}