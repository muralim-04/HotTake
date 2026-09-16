import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { userServices } from '../../services/userServices';
import { useUserStore } from '../../stores/userStore';
import { useNavigate } from "react-router-dom" 


export default function LogIn() {
    const setUser = useUserStore((state) => state.setUser);
    const navigate = useNavigate();

    const [userForm, setUserForm] = useState({
        email: '',
        password: ''
    });

    const loginMutation = useMutation({
        mutationFn: (formData: typeof userForm) => userServices.loginUser(formData),
        onSuccess: (data) => {
            console.log('Logged in successfully!');
            
            setUser(data); 
            navigate('/');
        },
        onError: (error) => {
            console.error('Login failed:', error);
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        loginMutation.mutate(userForm);
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-white">
                Welcome back
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                Enter your credentials to access your account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                    Email address
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
                </div>

                <div>
                <label
                    htmlFor="password"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-slate-700 bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-indigo-500 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                />
                </div>

                {loginMutation.isError && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-sm text-red-400">
                    {loginMutation.error?.message || 'Login failed. Please try again.'}
                </div>
                )}

                <button
                type="submit"
                disabled={loginMutation.isPending}
                className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                {loginMutation.isPending ? (
                    <>
                    <svg
                        className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
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
                    Logging in...
                    </>
                ) : (
                    'Log In'
                )}
                </button>
            </form>
            </div>
        </div>
    );
}