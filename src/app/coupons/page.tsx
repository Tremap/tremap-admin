"use client";

import { useState, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:5000/api";

type DiscountType = "percent" | "amount";
type Duration = "once" | "forever" | "repeating";
type Currency = "eur" | "gbp" | "usd";

interface GeneratedPromo {
  code: string;
  couponId: string;
}

function CouponsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [secret, setSecret] = useState("");

  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [percentOff, setPercentOff] = useState<string>("99.79");
  const [amountOff, setAmountOff] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("eur");
  const [duration, setDuration] = useState<Duration>("forever");
  const [durationInMonths, setDurationInMonths] = useState<string>("3");
  const [name, setName] = useState<string>("");
  const [amountOfCoupons, setAmountOfCoupons] = useState<string>("1");
  const [maxRedemptions, setMaxRedemptions] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedPromo[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const urlSecret = searchParams.get("secret");
    const storedSecret = localStorage.getItem("admin_secret");

    if (urlSecret) {
      setSecret(urlSecret);
      localStorage.setItem("admin_secret", urlSecret);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (storedSecret) {
      setSecret(storedSecret);
    } else {
      router.push("/");
    }
  }, [searchParams, router]);

  const applyOnePoundPreset = () => {
    setDiscountType("percent");
    setPercentOff("99.79");
    setDuration("forever");
    setName("TREMAP1");
    setAmountOfCoupons("1");
    setMaxRedemptions("");
    setExpiresAt("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    setCopied(false);

    const count = parseInt(amountOfCoupons, 10);
    if (!Number.isInteger(count) || count < 1) {
      setError("Number of codes must be a positive integer");
      return;
    }

    const body: Record<string, unknown> = {
      amountOfCoupons: count,
      duration,
    };

    if (discountType === "percent") {
      const pct = parseFloat(percentOff);
      if (!pct || pct <= 0 || pct > 100) {
        setError("Percent off must be between 0 and 100");
        return;
      }
      body.percent_off = pct;
    } else {
      const amt = parseFloat(amountOff);
      if (!amt || amt <= 0) {
        setError("Amount off must be greater than 0");
        return;
      }
      body.amount_off = Math.round(amt * 100);
      body.currency = currency;
    }

    if (duration === "repeating") {
      const months = parseInt(durationInMonths, 10);
      if (!Number.isInteger(months) || months < 1) {
        setError("Duration in months must be a positive integer");
        return;
      }
      body.duration_in_months = months;
    }

    if (name.trim()) body.name = name.trim();
    if (maxRedemptions) {
      const max = parseInt(maxRedemptions, 10);
      if (Number.isInteger(max) && max > 0) body.max_redemptions = max;
    }
    if (expiresAt) {
      body.redeem_by = Math.floor(new Date(expiresAt).getTime() / 1000);
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${AUTH_URL}/create-coupons`, body, {
        headers: { "x-admin-secret": secret },
      });
      setResults(res.data?.promoCodes || []);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Failed to create coupons";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(
        results.map((r) => r.code).join("\n")
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy to clipboard");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_secret");
    router.push("/");
  };

  if (!secret) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} />

      <main className="lg:ml-64 p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Coupons</h1>
            <p className="text-slate-500 mt-1">
              Generate Stripe discount / referral codes for the Pro
              subscription.
            </p>
          </header>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-700">
                New coupon
              </h2>
              <button
                type="button"
                onClick={applyOnePoundPreset}
                className="text-sm px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium transition-colors"
              >
                Apply &pound;1/month preset
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Discount type
                </label>
                <div className="flex gap-3">
                  <label
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                      discountType === "percent"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="percent"
                      checked={discountType === "percent"}
                      onChange={() => setDiscountType("percent")}
                      className="accent-emerald-600"
                    />
                    <span className="font-medium text-slate-700">
                      Percent off
                    </span>
                  </label>
                  <label
                    className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                      discountType === "amount"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="discountType"
                      value="amount"
                      checked={discountType === "amount"}
                      onChange={() => setDiscountType("amount")}
                      className="accent-emerald-600"
                    />
                    <span className="font-medium text-slate-700">
                      Amount off
                    </span>
                  </label>
                </div>
              </div>

              {discountType === "percent" ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Percent off (0&ndash;100)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={percentOff}
                    onChange={(e) => setPercentOff(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Amount off (major units)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amountOff}
                      onChange={(e) => setAmountOff(e.target.value)}
                      placeholder="e.g. 469"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as Currency)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="eur">EUR</option>
                      <option value="gbp">GBP</option>
                      <option value="usd">USD</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value as Duration)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="forever">Forever</option>
                    <option value="repeating">Repeating</option>
                    <option value="once">Once (first invoice)</option>
                  </select>
                </div>
                {duration === "repeating" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Months
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={durationInMonths}
                      onChange={(e) => setDurationInMonths(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Friendly name (optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. TREMAP1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of codes
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amountOfCoupons}
                    onChange={(e) => setAmountOfCoupons(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Max redemptions per code (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxRedemptions}
                    onChange={(e) => setMaxRedemptions(e.target.value)}
                    placeholder="Unlimited"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expires at (optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Generating..." : "Generate coupons"}
              </button>
            </form>
          </div>

          {results.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-700">
                  Generated codes ({results.length})
                </h2>
                <button
                  type="button"
                  onClick={copyAll}
                  className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors"
                >
                  {copied ? "Copied!" : "Copy all"}
                </button>
              </div>
              <ul className="divide-y divide-slate-100">
                {results.map((r) => (
                  <li
                    key={r.couponId}
                    className="py-3 flex items-center justify-between"
                  >
                    <code className="font-mono text-slate-800 text-sm">
                      {r.code}
                    </code>
                    <span className="text-xs text-slate-400 font-mono">
                      {r.couponId}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Codes are now live in Stripe. Customers enter them in the
                checkout&apos;s &ldquo;Add promotion code&rdquo; field.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CouponsPage() {
  return (
    <Suspense fallback={null}>
      <CouponsContent />
    </Suspense>
  );
}
