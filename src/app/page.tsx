"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

export default function Home() {
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (storedSecret) {
      setSecret(storedSecret);
      setIsAuthenticated(true);
      fetchStats(storedSecret);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret) {
      setIsAuthenticated(true);
      localStorage.setItem("admin_secret", secret);
      fetchStats(secret);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSecret("");
    localStorage.removeItem("admin_secret");
  };

  const fetchStats = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/dashboard`, {
        headers: { "x-admin-secret": token },
      });
      setStats(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                TreMap Admin
              </h1>
              <p className="text-emerald-200/70">Management Console</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent transition-all"
                placeholder="Enter access code..."
              />
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-500">Overview of TreMap activity</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Trees Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 2l-7 14h4v6h6v-6h4l-7-14z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-slate-500 font-medium mb-1">
                  Total Trees
                </div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.treesCount}
                </div>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-8 h-8"
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
              </div>
              <div>
                <div className="text-slate-500 font-medium mb-1">
                  Total Users
                </div>
                <div className="text-3xl font-bold text-slate-800">
                  {stats.usersCount}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Grid */}
        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Trees */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  Last 10 Trees
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600">
                        Species
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-600">
                        User
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-600">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentTrees.map((tree: any) => (
                      <tr key={tree._id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-800 capitalize">
                            {tree.common || "Unknown"}
                          </div>
                          <div className="text-slate-500 italic lowercase">
                            {tree.genus} {tree.species}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-600">
                          {tree.user.firstName || tree.user.email}
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {new Date(tree.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">
                  Last 5 Active Users
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600">
                        User
                      </th>
                      <th className="px-6 py-3 font-semibold text-slate-600">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentUsers.map((user: any) => (
                      <tr key={user._id} className="hover:bg-slate-50">
                        <td className="px-6 py-3">
                          <div className="font-medium text-slate-800">
                            {user.firstName}
                          </div>
                          <div className="text-slate-500 text-xs">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-20 text-slate-500">
            Loading dashboard...
          </div>
        )}
      </main>
    </div>
  );
}
