"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/admin";

function SponsorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState("");
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [genus, setGenus] = useState("");
  const [species, setSpecies] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [redirect, setRedirect] = useState("");
  const [tooltip, setTooltip] = useState("");
  const [overridePaid, setOverridePaid] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urlSecret = searchParams.get("secret");
    const storedSecret = localStorage.getItem("admin_secret");

    if (urlSecret) {
      setSecret(urlSecret);
      localStorage.setItem("admin_secret", urlSecret);
      // Clean URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else if (storedSecret) {
      setSecret(storedSecret);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (secret) fetchSponsors();
  }, [secret]);

  const fetchSponsors = async () => {
    try {
      const res = await axios.get(`${API_URL}/sponsors`, {
        headers: { "x-admin-secret": secret },
      });
      setSponsors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !genus || !species) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("genus", genus);
      formData.append("species", species);
      formData.append("logo", file);
      if (sponsorName) formData.append("sponsorName", sponsorName);
      if (redirect) formData.append("sponsorRedirect", redirect);
      if (tooltip) formData.append("tooltip", tooltip);
      if (overridePaid) formData.append("overridePaidOrganizations", "true");

      await axios.post(`${API_URL}/sponsors`, formData, {
        headers: {
          "x-admin-secret": secret,
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset
      setGenus("");
      setSpecies("");
      setSponsorName("");
      setRedirect("");
      setTooltip("");
      setFile(null);
      setPreviewUrl(null);
      setOverridePaid(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSponsors();
    } catch (err) {
      alert("Failed to add sponsor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this sponsor?")) return;
    setSponsors((prev) => prev.filter((s) => s._id !== id));
    try {
      await axios.delete(`${API_URL}/sponsors/${id}`, {
        headers: { "x-admin-secret": secret },
      });
    } catch {
      fetchSponsors();
    }
  };

  if (!secret)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
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
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-xl font-medium transition-colors"
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
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-medium">
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
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Sponsor Manager
          </h1>
          <p className="text-slate-500">
            Configure tree species sponsorship branding
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6">
                Add Sponsor Rule
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Species
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Genus"
                      value={genus}
                      onChange={(e) => setGenus(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Species"
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Sponsor Name"
                    value={sponsorName}
                    onChange={(e) => setSponsorName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <input
                    type="url"
                    placeholder="Website URL"
                    value={redirect}
                    onChange={(e) => setRedirect(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Tooltip Text"
                    value={tooltip}
                    onChange={(e) => setTooltip(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                {/* Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Logo
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files?.[0]) {
                        setFile(e.dataTransfer.files[0]);
                        setPreviewUrl(
                          URL.createObjectURL(e.dataTransfer.files[0]),
                        );
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-500 hover:bg-slate-50"
                    }`}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="h-16 object-contain mb-2"
                        />
                        <span className="text-sm text-emerald-600 font-medium">
                          Click to change
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-400">
                        <svg
                          className="w-8 h-8 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          Drop logo here
                        </span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overridePaid}
                    onChange={(e) => setOverridePaid(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-600">
                    Override paid organization logos
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !file || !genus || !species}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? "Adding..." : "Add Sponsor"}
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Active Sponsors
              </h2>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                {sponsors.length} rules
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-4"
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
                <p className="text-slate-500 font-medium">
                  No sponsor rules yet
                </p>
                <p className="text-slate-400 text-sm">
                  Add your first rule on the left
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sponsors.map((sponsor) => (
                  <div
                    key={sponsor._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 group hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="h-14 flex items-center">
                        <img
                          src={sponsor.logoUrl}
                          alt=""
                          className="h-full object-contain max-w-[120px]"
                        />
                      </div>
                      <button
                        onClick={() => handleDelete(sponsor._id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-semibold text-slate-800 capitalize mb-1">
                      {sponsor.sponsorName || "Unnamed"}
                    </h3>
                    <p className="text-sm text-slate-500 italic capitalize">
                      {sponsor.genus} {sponsor.species}
                    </p>
                    {sponsor.sponsorRedirect && (
                      <a
                        href={sponsor.sponsorRedirect}
                        target="_blank"
                        className="inline-block mt-3 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Visit website →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SponsorsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
        </div>
      }
    >
      <SponsorsContent />
    </Suspense>
  );
}
