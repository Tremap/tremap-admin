"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface ComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  fetchEndpoint: string;
  placeholder?: string;
  dependsOn?: string; // e.g. for loading species only when genus is selected
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/admin", "") ||
  "http://localhost:8080/api";

export default function Combobox({
  label,
  value,
  onChange,
  fetchEndpoint,
  placeholder,
  dependsOn,
}: ComboboxProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal query state with external value prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchTerm: string) => {
    // If dependsOn is required but empty, don't fetch (e.g. need Genus to fetch Species)
    if (fetchEndpoint.includes("genus=") && !dependsOn) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Build URL dynamically
      let url = `${API_BASE_URL}${fetchEndpoint}`;
      if (dependsOn) {
        url += `&genus=${dependsOn}`;
      }

      const res = await axios.get(url);
      let data: string[] = [];

      if (res.data.genus) {
        data = res.data.genus;
      } else if (res.data.genusArr) {
        data = res.data.genusArr;
      }

      // Filter locally based on search term (case-insensitive)
      if (searchTerm) {
        data = data.filter((item) =>
          item.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      setSuggestions(data.slice(0, 50)); // Limit to 50 suggestions
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setQuery(newVal);
    onChange(newVal);
    setIsOpen(true);
    fetchSuggestions(newVal);
  };

  const handleSelect = (item: string) => {
    setQuery(item);
    onChange(item);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsOpen(true);
    fetchSuggestions(query);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        placeholder={placeholder}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {loading ? (
            <li className="px-4 py-2 text-sm text-slate-400">Loading...</li>
          ) : (
            suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => handleSelect(item)}
                className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {item}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
