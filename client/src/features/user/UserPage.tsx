import { useState, useRef } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userServices } from '../../services/userServices';
import { useUserStore } from '../../stores/userStore';

export default function UserPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setUserDetails = useUserStore((state) => state.setUserDetails);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    bio: '',
  });

  const { data: user } = useSuspenseQuery({
    queryKey: ['userProfile'],
    queryFn: userServices.getUserProfile,
  });

  const updateDetailsMutation = useMutation({
    mutationFn: userServices.changeUserDetails,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile'], updatedProfile);
      setIsEditing(false);
      setUserDetails({ userName: updatedProfile.userName})
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: userServices.changeUserAvatar,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['userProfile'], updatedProfile);
      setUserDetails({ avatarUrl: updatedProfile.avatarUrl});
    },
  });

  const handleStartEditing = () => {
    setFormData({
      userName: user.userName,
      bio: user.bio || '',
    });
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetailsMutation.mutate(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      updateAvatarMutation.mutate({ image: file });
    }
  };


  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-slate-950/50 backdrop-blur-sm">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.userName}
                    className="h-24 w-24 rounded-full border-2 border-slate-700 bg-slate-800 object-cover shadow-lg sm:h-28 sm:w-28"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 text-3xl font-bold uppercase text-indigo-400 shadow-lg sm:h-28 sm:w-28">
                    {user.userName ? user.userName.trim().charAt(0) : '?'}
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={updateAvatarMutation.isPending}
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800/90 text-slate-300 shadow-md transition hover:border-indigo-500 hover:bg-indigo-600 hover:text-white disabled:opacity-50"
                  title="Change profile photo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleStartEditing}
                    className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEditing}
                      disabled={updateDetailsMutation.isPending}
                      className="cursor-pointer rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="user-details-form"
                      disabled={updateDetailsMutation.isPending}
                      className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {updateDetailsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <form id="user-details-form" onSubmit={handleSaveDetails} className="mt-6 space-y-4 max-w-xl">
                <div>
                  <label htmlFor="username" className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Username
                  </label>
                  <div className="relative mt-1.5 flex rounded-xl border border-slate-700 bg-slate-800/60 shadow-inner focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <span className="flex select-none items-center pl-3.5 text-sm text-slate-400">@</span>
                    <input
                      id="username"
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      className="w-full rounded-xl bg-transparent py-2 pl-1 pr-3.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1 text-xs text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-slate-500"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>{user.email}</span>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1.5 w-full resize-none rounded-xl border border-slate-700 bg-slate-800/60 p-3 text-sm leading-relaxed text-white placeholder-slate-500 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Tell us a little bit about yourself..."
                  />
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-3">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  @{user.userName}
                </h1>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-slate-500"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>{user.email}</span>
                </div>

                <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {user.bio || (
                    <span className="italic text-slate-500">
                      No bio added yet.
                    </span>
                  )}
                </p>
              </div>
            )}

            <div className="mt-6 flex border-b border-slate-800">
              <button
                type="button"
                className="cursor-pointer border-b-2 border-indigo-500 px-6 py-3 text-sm font-semibold text-white transition"
              >
                Created Posts
              </button>
              <button
                type="button"
                className="cursor-pointer border-b-2 border-transparent px-6 py-3 text-sm font-medium text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
              >
                Liked Posts
              </button>
            </div>
          </div>
        </header>

        <div className="mt-6"></div>
      </div>
    </div>
  );
}