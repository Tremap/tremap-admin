"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

interface Enterprise {
  _id: string;
  enterpriseName: string;
  typeOfEnterprise: string | null;
  address: string | null;
  website: string | null;
  createdAt: string | null;
  memberCount: number;
  plan: string;
  subscriptionEndsAt: number | null;
  canceled: boolean;
  boughtTrees: number | null;
  boughtUsers: number | null;
  boughtImages: number | null;
  disabled: boolean;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (!storedSecret) {
      router.push("/");
    } else {
      setSecret(storedSecret);
      fetchEnterprises(storedSecret, "", 1);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  const fetchEnterprises = async (
    token: string,
    query: string,
    pageNum: number,
  ) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${API_URL}/enterprises?q=${encodeURIComponent(query)}&page=${pageNum}&limit=50`,
        { headers: { "x-admin-secret": token } },
      );
      setEnterprises(res.data.enterprises || []);
      setTotalCount(res.data.count || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEnterprises(secret, searchQuery, 1);
  };

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchEnterprises(secret, searchQuery, newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-800">Organizations</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
              {totalCount} Organizations
            </span>
          </div>
          <p className="text-slate-500 mt-2">
            All registered enterprises and their subscription state
          </p>
        </div>

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
                placeholder="Search by name, type, or ID..."
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

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Type</th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Members
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600">Plan</th>
                <th className="px-6 py-4 font-semibold text-slate-600">
                  Created
                </th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enterprises.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No organizations found.
                  </td>
                </tr>
              ) : (
                enterprises.map((ent) => (
                  <tr
                    key={ent._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-sm">
                          {ent.enterpriseName?.[0]?.toUpperCase() || "O"}
                        </div>
                        <span className="font-medium text-slate-800">
                          {ent.enterpriseName}
                        </span>
                        {ent.disabled && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-semibold">
                            Disabled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {ent.typeOfEnterprise || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {ent.memberCount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          ent.plan === "Pro"
                            ? "bg-amber-100 text-amber-700"
                            : ent.plan === "Free"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {ent.plan}
                      </span>
                      {ent.canceled && (
                        <span className="ml-2 text-xs text-red-600">
                          (canceled)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {ent.createdAt
                        ? new Date(ent.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/organizations/${ent._id}`}
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

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages || loading}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
