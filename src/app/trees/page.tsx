"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Combobox from "@/components/Combobox";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

export default function TreesPage() {
  const [secret, setSecret] = useState("");
  const [trees, setTrees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genus, setGenus] = useState("");
  const [species, setSpecies] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const storedSecret = localStorage.getItem("admin_secret");
    if (!storedSecret) {
      router.push("/");
    } else {
      setSecret(storedSecret);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  const handleSearch = async (e?: React.FormEvent, pageNum = 1) => {
    if (e) e.preventDefault();
    if (!genus || !species) {
      setError("Both Genus and Species are required.");
      return;
    }

    setLoading(true);
    setError("");
    setPage(pageNum);

    try {
      // Changed limit to 20 as requested
      const res = await axios.get(
        `${API_URL}/trees?genus=${genus}&species=${species}&page=${pageNum}&limit=20`,
        {
          headers: { "x-admin-secret": secret },
        },
      );
      setTrees(res.data.trees);
      setTotalCount(res.data.count);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch trees");
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      handleSearch(undefined, newPage);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Trees Management
          </h1>
          <p className="text-slate-500">Search and manage trees by species</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <form
            onSubmit={(e) => handleSearch(e, 1)}
            className="flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full">
              <Combobox
                label="Genus"
                value={genus}
                onChange={setGenus}
                fetchEndpoint="/suggestions?type=genus"
                placeholder="e.g. Quercus"
              />
            </div>
            <div className="flex-1 w-full">
              <Combobox
                label="Species"
                value={species}
                onChange={setSpecies}
                fetchEndpoint="/suggestions?type=species"
                dependsOn={genus}
                placeholder="e.g. robur"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search Trees"}
            </button>
          </form>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Image
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Common Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Scientific Name
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    User
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Date
                  </th>
                  <th className="px-6 py-4 font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trees.length > 0 ? (
                  trees.map((tree) => (
                    <tr key={tree._id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                          {tree.image ? (
                            <img
                              src={tree.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <svg
                                className="w-6 h-6"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 2L3 7v11h5v-6h4v6h5V7l-7-5z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium text-slate-800 capitalize">
                        {tree.common || "Unknown"}
                      </td>
                      <td className="px-6 py-3 text-slate-600 italic">
                        {tree.genus} {tree.species}
                      </td>
                      <td className="px-6 py-3 text-slate-600">
                        {tree.user.firstName || tree.user.email}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(tree.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        {/* Placeholder for future actions */}
                        <span className="text-slate-400">-</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      {loading
                        ? "Searching..."
                        : "No trees found. Try searching for a genus and species."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {trees.length} of {totalCount} trees
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-slate-600 flex items-center">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
