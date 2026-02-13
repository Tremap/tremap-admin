"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

export default function UsersPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auth Check
  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (!storedSecret) {
      router.push("/");
    } else {
      setSecret(storedSecret);
      fetchUsers(storedSecret, "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  const fetchUsers = async (token: string, query: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/users?q=${query}`, {
        headers: { "x-admin-secret": token },
      });
      // Handle both old array format (just in case) and new object format
      if (Array.isArray(res.data)) {
        setUsers(res.data);
        setTotalCount(res.data.length);
      } else {
        setUsers(res.data.users || []);
        setTotalCount(res.data.count || 0);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(secret, searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">
              User Management
            </h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {totalCount} Users
            </span>
          </div>
          <p className="text-slate-500 mt-2">
            View and manage registered users
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 mb-8 max-w-2xl">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                placeholder="Search by name, email, or ID..."
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "Search"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Email
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Joined
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {user.firstName?.[0] || user.email?.[0] || "U"}
                        </div>
                        <span className="font-medium text-slate-800">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/users/${user._id}`}
                        className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
