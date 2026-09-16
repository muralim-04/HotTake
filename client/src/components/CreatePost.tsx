import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostReq } from "../types/PostTypes";
import { postServices } from "../services/postService";

export default function CreatePost() {
    const queryClient = useQueryClient();
    
    const [postForm, setPostForm] = useState<PostReq>({
        content: '',
        image: null
    });

    const createPostMutation = useMutation({
        mutationFn: (formData: FormData) => postServices.createPost(formData),
        onSuccess: () => {
            setPostForm({ content: '', image: null });
            
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
        onError: (error) => {
            console.error('Failed to create post:', error);
        }
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPostForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPostForm(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!postForm.content) return; 

        const formData = new FormData();

        formData.append('Content', postForm.content);

        if (postForm.image) {
            formData.append('Image', postForm.image); 
        }

        createPostMutation.mutate(formData);
    };

    return (
        <div className="w-full border-b border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>

            <textarea
                name="content"
                value={postForm.content}
                onChange={handleTextChange}
                placeholder="Drop a spicy take..."
                rows={3}
                className="w-full resize-none bg-transparent text-lg text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />

            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <div className="flex items-center gap-3">
                <label
                    className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-slate-800/60 text-slate-400 ring-1 ring-slate-700/50 transition hover:bg-slate-800 hover:text-indigo-400 hover:ring-indigo-500/40"
                    title="Attach image"
                    >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 transition group-hover:scale-105"
                    >
                        <rect width="18" height="18" x="3" y="3" rx="3" />
                        {/* Sun / Lens */}
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>
                </label>

                {postForm.image && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300">
                    <span className="max-w-[160px] truncate">{postForm.image.name}</span>
                    </div>
                )}
                </div>

                <button
                    type="submit"
                    disabled={createPostMutation.isPending || !postForm.content.trim()}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                {createPostMutation.isPending ? (
                    <>
                    <svg
                        className="-ml-0.5 mr-2 h-4 w-4 animate-spin text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        />
                        <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Posting...
                    </>
                ) : (
                    'Post'
                )}
                </button>
            </div>
            </form>

            {createPostMutation.isError && (
            <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/40 p-2.5 text-xs text-red-400">
                {createPostMutation.error?.message || 'Failed to publish post. Please try again.'}
            </div>
            )}
        </div>
    );
}