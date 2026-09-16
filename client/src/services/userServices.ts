import { apiClient } from "../lib/axios"
import { type LoginUser, type UserAvatar, type UserDetails, type UserProfile, type UserReq, type UserRes } from "../types/UserTypes"

export const userServices = {
    getUserProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get<UserProfile>('api/user/profile');
        return response.data;
    },
    
    registerUser: async (userData: UserReq): Promise<UserRes> => {
        const response = await apiClient.post<UserRes>('api/auth/register', userData);
        return response.data;
    },

    loginUser: async (userData: LoginUser): Promise<UserRes> => {
        const response = await apiClient.post<UserRes>('api/auth/login', userData);
        return response.data;
    },

    logOutUser: async (): Promise<boolean> => {
        const response = await apiClient.post<boolean>('api/auth/logout');
        return response.data;
    },

    changeUserDetails: async (userDetails: UserDetails): Promise<UserProfile> => {
        const response = await apiClient.patch<UserProfile>('api/user/details', userDetails)
        return response.data
    },

    changeUserAvatar: async (image: UserAvatar): Promise<UserProfile> => {
        const response = await apiClient.patch<UserProfile>('api/user/avatar', image, {
        headers: {
            'Content-Type': 'multipart/form-data' 
        }
    });
        return response.data;
    },
}