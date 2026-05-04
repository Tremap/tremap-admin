"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

interface Member {
  userId: string;
  role: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  joined: string | null;
}

interface EnterpriseDetail {
  _id: string;
  enterpriseName: string;
  typeOfEnterprise: string | null;
  address: string | null;
  website: string | null;
  avatar: string | null;
  createdAt: string | null;
  subscription: any | null;
  plan: string;
  boughtTrees: number | null;
  boughtUsers: number | null;
  boughtImages: number | null;
  disabled: boolean;
  memberCount: number;
}

const formatNumber = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n >= 2147483647) return "Unlimited";
  return n.toLocaleString();
};

const formatDate = (v: string | number | null) => {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  if (d.getFullYear() >= 9999) return "Never";
  return d.toLocaleDateString();
};

export default function OrganizationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<{
    enterprise: EnterpriseDetail;
    members: Member[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (!storedSecret) {
      router.push("/");
    } else {
      setSecret(storedSecret);
      if (params.id) {
        fetchEnterprise(storedSecret, params.id as string);
      }
    }
  }, [params.id]);

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  const fetchEnterprise = async (token: string, id: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_URL}/enterprises/${id}`, {
        headers: { "x-admin-secret": token },
      });
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Organization not found");
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
            href="/organizations"
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
          <h1 className="text-2xl font-bold text-slate-800">Organization</h1>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-500">
            Loading organization...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start gap-6 flex-wrap">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                  {data.enterprise.enterpriseName?.[0]?.toUpperCase() || "O"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {data.enterprise.enterpriseName}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        data.enterprise.plan === "Pro"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {data.enterprise.plan} Plan
                    </span>
                    {data.enterprise.disabled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 mt-1">
                    {data.enterprise.typeOfEnterprise || "—"}
                  </p>
                  <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-mono">
                    ID: {data.enterprise._id}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-emerald-600">
                    {data.enterprise.memberCount}
                  </div>
                  <div className="text-sm text-slate-500">Members</div>
                </div>
              </div>
            </div>

            {/* Stat / Subscription grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Created
                </div>
                <div className="text-lg font-semibold text-slate-800 mt-1">
                  {formatDate(data.enterprise.createdAt)}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Subscription Ends
                </div>
                <div className="text-lg font-semibold text-slate-800 mt-1">
                  {formatDate(
                    data.enterprise.subscription?.subscriptionEndsAt ?? null,
                  )}
                </div>
                {data.enterprise.subscription?.canceled && (
                  <div className="text-xs text-red-600 mt-1">Canceled</div>
                )}
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Website
                </div>
                <div className="text-sm font-medium text-slate-800 mt-1 truncate">
                  {data.enterprise.website ? (
                    <a
                      href={data.enterprise.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      {data.enterprise.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>

            {/* Quotas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Tree Quota
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {formatNumber(data.enterprise.boughtTrees)}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  User Quota
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {formatNumber(data.enterprise.boughtUsers)}
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Image Quota
                </div>
                <div className="text-2xl font-bold text-slate-800 mt-1">
                  {formatNumber(data.enterprise.boughtImages)}
                </div>
              </div>
            </div>

            {/* Members */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Members
              </h3>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">
                        Name
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-600">
                        Email
                      </th>
                      <th className="px-6 py-4 font-semibold text-slate-600">
                        Role
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
                    {data.members.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No members.
                        </td>
                      </tr>
                    ) : (
                      data.members.map((m) => (
                        <tr
                          key={m.userId}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {m.firstName?.[0] || m.email?.[0] || "U"}
                              </div>
                              <span className="font-medium text-slate-800">
                                {m.firstName || m.lastName
                                  ? `${m.firstName || ""} ${m.lastName || ""}`.trim()
                                  : "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {m.email || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                              {m.role || "Member"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {formatDate(m.joined)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/users/${m.userId}`}
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
