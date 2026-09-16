import { Link, } from "react-router-dom" 
import { useUserStore } from "../stores/userStore";
import { userServices } from "../services/userServices";


export default function Navbar () {
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const handleLogOut = async () => {
    try {
      const response = await userServices.logOutUser();
      if (response === true) {
        logout();
      }
    } catch (error) {
      console.error("Failed to log out:", error);
      logout();
    }
  };

  const baseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  const fullAvatarUrl = user?.avatarUrl
    ? `${baseUrl}/${user.avatarUrl.replace(/^\//, "")}`
    : undefined;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-3.5 backdrop-blur-md">
      <Link
        to="/"
        className="group flex items-center gap-2 text-xl font-bold tracking-tight text-white transition hover:opacity-90"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-base font-black text-white shadow-md shadow-orange-500/25 transition group-hover:bg-orange-600">
          🔥
        </span>
        <span>HotTake</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              to="/user"
              className="flex items-center gap-2.5 rounded-full p-1 pr-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
            >
              {user.avatarUrl ? (
                <img
                  src={fullAvatarUrl}
                  alt={user.userName}
                  className="h-8 w-8 rounded-full border border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold uppercase text-indigo-400">
                  {user.userName ? user.userName.charAt(0) : '?'}
                </div>
              )}
              <span className="max-w-[120px] truncate">{user.userName}</span>
            </Link>

            <button
              onClick={handleLogOut}
              className="rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-red-500/40 hover:bg-red-950/30 hover:text-red-400"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}