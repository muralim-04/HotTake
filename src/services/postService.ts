import { apiClient } from "../lib/axios"
import type { CommentReq, CommentRes, LikePostRes, PaginationResult,  PostRes } from "../types/PostTypes";

export const postServices = {
    createPost: async (post: FormData): Promise<PostRes> => {
        const response = await apiClient.post<PostRes>('api/post/createPost', post, {
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    });
        return response.data;
    },
    
    getAllPosts: async (pageNumber: number, pageSize: number): Promise<PaginationResult<PostRes>> => {
        const response = await apiClient.get<PaginationResult<PostRes>>(`api/post/getAllPosts?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
    },

    getPost: async (postId: number): Promise<PostRes> => {
        const response = await apiClient.get<PostRes>(`api/post/getPost/${postId}`);
        return response.data;
    },

    getPostComments: async (postId: number, pageNumber: number, pageSize: number): Promise<PaginationResult<CommentRes>> => {
        const response = await apiClient.get<PaginationResult<CommentRes>>(`api/post/getPostsComments?postId=${postId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
        return response.data;
    },

    likePost: async (postId: number): Promise<LikePostRes> => {
        const response = await apiClient.post<LikePostRes>(`api/post/likeThePost/${postId}`);
        return response.data;
    },

    leaveComment: async (comment: CommentReq): Promise<CommentRes> => {
        const response = await apiClient.post<CommentRes>('api/post/leaveComment/', comment);
        return response.data;
    },

    deletePost: async (postId: number): Promise<boolean> => {
        const response = await apiClient.delete<boolean>(`api/post/deletePost/${postId}`);
        return response.data;
    },

    deletePostAdmin: async (postId: number): Promise<boolean> => {
        const response = await apiClient.delete<boolean>(`api/post/deletePostAdmin/${postId}`);
        return response.data;
    },

}