import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRes } from "../types/UserTypes";

type UserStore = {
    user: UserRes | null
    setUser: (user: UserRes) => void,
    setUserDetails: (details: { avatarUrl?: string; userName?: string }) => void;
    logout: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            setUserDetails: ({ avatarUrl, userName }) =>
                set((state) => {
                if (!state.user) return { user: null };

                return {
                    user: {
                    ...state.user,
                    avatarUrl: avatarUrl ?? state.user.avatarUrl,
                    userName: userName ?? state.user.userName,
                    },
                };
            }),
            logout: () => {
                set({ user: null });
                window.location.href = '/login';
            },
        }),
        {
            name: "user-storage",
        }
    )
);