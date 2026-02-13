"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 p-6 hidden lg:block">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2L3 7v11h5v-6h4v6h5V7l-7-5z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-slate-800">TreMap</span>
      </div>

      <nav className="space-y-2">
        <Link
          href="/"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive("/")
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Dashboard
        </Link>

        <Link
          href="/users"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive("/users")
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Users
        </Link>

        <Link
          href="/sponsors"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
            isActive("/sponsors")
              ? "bg-emerald-50 text-emerald-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          Sponsors
        </Link>
      </nav>

      <button
        onClick={onLogout}
        className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </button>
    </aside>
  );
}
