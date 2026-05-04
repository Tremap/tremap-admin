"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [secret, setSecret] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Auth Check & Fetch
  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (!storedSecret) {
      router.push("/");
    } else {
      setSecret(storedSecret);
      if (params.id) {
        fetchUser(storedSecret, params.id as string);
      }
    }
  }, [params.id]);

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  const fetchUser = async (token: string, userId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/user-trees?id=${userId}`, {
        headers: { "x-admin-secret": token },
      });
      setUserData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "User not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/users"
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-5 h-5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-500">
            Loading user data...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {userData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {userData.user.name?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {userData.user.name || "Unknown"}
                  </h2>
                  <p className="text-slate-500">{userData.user.email}</p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-mono">
                    ID: {userData.user._id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-600">
                    {userData.count}
                  </div>
                  <div className="text-sm text-slate-500">Total Trees</div>
                </div>
              </div>
            </div>

            {/* Organization Card */}
            {userData.enterprise ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                        Organization
                      </div>
                      <Link
                        href={`/organizations/${userData.enterprise._id}`}
                        className="text-xl font-bold text-slate-800 hover:text-emerald-600 transition-colors block truncate"
                      >
                        {userData.enterprise.enterpriseName}
                      </Link>
                      <div className="text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        {userData.enterprise.typeOfEnterprise && (
                          <span>{userData.enterprise.typeOfEnterprise}</span>
                        )}
                        {userData.enterprise.role && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span>Role: {userData.enterprise.role}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      userData.enterprise.plan === "Pro"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {userData.enterprise.plan} Plan
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-3 text-slate-500">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Not part of any organization</span>
              </div>
            )}

            {/* Trees Grid */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Uploaded Trees
              </h3>
              {userData.trees.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-12 text-center text-slate-500">
                  No trees found for this user
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {userData.trees.map((tree: any) => (
                    <div
                      key={tree._id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                        {tree.image ? (
                          <img
                            src={tree.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-emerald-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 2L3 7v11h5v-6h4v6h5V7l-7-5z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-slate-700">
                          {tree.createdAt
                            ? new Date(tree.createdAt).getFullYear()
                            : "N/A"}
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-800 capitalize">
                          {tree.common || "Unknown"}
                        </h4>
                        <p className="text-sm text-slate-500 italic capitalize">
                          {tree.genus} {tree.species}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            {tree.createdAt
                              ? new Date(tree.createdAt).toLocaleDateString()
                              : "No Date"}
                          </span>
                          {tree.geometry && (
                            <a
                              href={`https://www.google.com/maps?q=${tree.geometry.coordinates[1]},${tree.geometry.coordinates[0]}`}
                              target="_blank"
                              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                            >
                              View on Map →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
