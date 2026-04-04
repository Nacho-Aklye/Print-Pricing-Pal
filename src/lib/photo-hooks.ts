import { useState, useEffect } from "react";
import type { PhotoPackage, PhotoExtra, PhotoQuote, PhotoBranding } from "./photo-types";
import { DEFAULT_PACKAGES, DEFAULT_EXTRAS, DEFAULT_BRANDING } from "./photo-types";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function usePhotoPackages() {
  const [packages, setPackages] = useState<PhotoPackage[]>(() => load("photo_packages", DEFAULT_PACKAGES));

  useEffect(() => {
    localStorage.setItem("photo_packages", JSON.stringify(packages));
  }, [packages]);

  const addPackage = (pkg: Omit<PhotoPackage, "id">) => {
    setPackages((prev) => [...prev, { ...pkg, id: Date.now().toString() }]);
  };

  const updatePackage = (id: string, updates: Partial<PhotoPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return { packages, addPackage, updatePackage, deletePackage };
}

export function usePhotoExtras() {
  const [extras, setExtras] = useState<PhotoExtra[]>(() => load("photo_extras", DEFAULT_EXTRAS));

  useEffect(() => {
    localStorage.setItem("photo_extras", JSON.stringify(extras));
  }, [extras]);

  const addExtra = (extra: Omit<PhotoExtra, "id">) => {
    setExtras((prev) => [...prev, { ...extra, id: Date.now().toString() }]);
  };

  const updateExtra = (id: string, updates: Partial<PhotoExtra>) => {
    setExtras((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteExtra = (id: string) => {
    setExtras((prev) => prev.filter((e) => e.id !== id));
  };

  return { extras, addExtra, updateExtra, deleteExtra };
}

export function usePhotoQuotes() {
  const [quotes, setQuotes] = useState<PhotoQuote[]>(() => load("photo_quotes", []));

  useEffect(() => {
    localStorage.setItem("photo_quotes", JSON.stringify(quotes));
  }, [quotes]);

  const addQuote = (quote: Omit<PhotoQuote, "id" | "createdAt">) => {
    setQuotes((prev) => [...prev, { ...quote, id: Date.now().toString(), createdAt: Date.now() }]);
    return Date.now().toString();
  };

  const updateQuote = (id: string, updates: Partial<PhotoQuote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return { quotes, addQuote, updateQuote, deleteQuote };
}

export function usePhotoBranding() {
  const [branding, setBranding] = useState<PhotoBranding>(() => load("photo_branding", DEFAULT_BRANDING));

  useEffect(() => {
    localStorage.setItem("photo_branding", JSON.stringify(branding));
  }, [branding]);

  const updateBranding = (updates: Partial<PhotoBranding>) => {
    setBranding((prev) => ({ ...prev, ...updates }));
  };

  return { branding, updateBranding };
}
