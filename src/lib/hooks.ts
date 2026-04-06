import { useState, useEffect, useCallback } from "react";
import type { Material, Project, Expense, Client, PhotoQuote, PhotoPackage, BrandSettings } from "./types";
import { DEFAULT_MATERIALS } from "./types";

const DATA_VERSION = 6;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Migrate old data */
function migrateData() {
  const version = load("calc3d_version", 0);
  if (version >= DATA_VERSION) return;

  if (version < 2) {
    const oldRecipes = load<any[]>("calc3d_recipes", []);
    if (oldRecipes.length > 0) {
      const migrated = oldRecipes.map((r) => ({
        ...r,
        modelCost: r.modelCost ?? 0,
        modelSource: r.modelSource ?? "",
        photos: r.photos ?? [],
      }));
      localStorage.setItem("calc3d_projects", JSON.stringify(migrated));
    }
  }

  if (version < 3) {
    const existing = load<any[]>("calc3d_projects", []);
    if (existing.length > 0) {
      const migrated = existing.map((p) => ({
        ...p,
        photos: p.photos ?? [],
      }));
      localStorage.setItem("calc3d_projects", JSON.stringify(migrated));
    }
  }

  if (version < 4) {
    const mats = load<any[]>("calc3d_materials", []);
    if (mats.length > 0) {
      const migrated = mats.map((m) => ({
        ...m,
        spoolWeightG: m.spoolWeightG ?? 1000,
        weightUsedG: m.weightUsedG ?? 0,
      }));
      localStorage.setItem("calc3d_materials", JSON.stringify(migrated));
    }
    const fab = load<any[]>("calc3d_fabricated", []);
    if (fab.length > 0) {
      const migrated = fab.map((f) => ({
        ...f,
        isFree: f.isFree ?? false,
        useFixedPrice: f.useFixedPrice ?? false,
        fixedPrice: f.fixedPrice ?? 0,
      }));
      localStorage.setItem("calc3d_fabricated", JSON.stringify(migrated));
    }
  }

  // v5: spoolCount + quantity + expenses
  if (version < 5) {
    const mats = load<any[]>("calc3d_materials", []);
    if (mats.length > 0) {
      const migrated = mats.map((m) => ({
        ...m,
        spoolCount: m.spoolCount ?? 1,
      }));
      localStorage.setItem("calc3d_materials", JSON.stringify(migrated));
    }
    const fab = load<any[]>("calc3d_fabricated", []);
    if (fab.length > 0) {
      const migrated = fab.map((f) => ({
        ...f,
        quantity: f.quantity ?? 1,
      }));
      localStorage.setItem("calc3d_fabricated", JSON.stringify(migrated));
    }
  }

  // v6: migrate expenses to have source field
  if (version < 6) {
    const exps = load<any[]>("calc3d_expenses", []);
    if (exps.length > 0) {
      const migrated = exps.map((e) => ({
        ...e,
        source: e.source ?? "3d",
        notes: e.notes ?? "",
        paymentMethod: e.paymentMethod ?? "efectivo",
      }));
      localStorage.setItem("calc3d_expenses", JSON.stringify(migrated));
    }
  }

  localStorage.setItem("calc3d_version", JSON.stringify(DATA_VERSION));
}

migrateData();

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>(() => load("calc3d_materials", DEFAULT_MATERIALS));

  useEffect(() => {
    localStorage.setItem("calc3d_materials", JSON.stringify(materials));
  }, [materials]);

  const addMaterial = (mat: Omit<Material, "id">) => {
    setMaterials((prev) => [...prev, { ...mat, id: Date.now().toString() }]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return { materials, addMaterial, updateMaterial, deleteMaterial };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => load("calc3d_projects", []));

  useEffect(() => {
    localStorage.setItem("calc3d_projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Omit<Project, "id" | "createdAt">) => {
    setProjects((prev) => [...prev, { ...project, id: Date.now().toString(), createdAt: Date.now() }]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return { projects, addProject, updateProject, deleteProject };
}

/** @deprecated Use useProjects instead */
export function useRecipes() {
  const { projects, addProject, deleteProject } = useProjects();
  return {
    recipes: projects,
    addRecipe: addProject,
    deleteRecipe: deleteProject,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState(() =>
    load("calc3d_settings", {
      electricityCostKwh: 150,
      printerWatts: 200,
      hourlyRate: 3000,
      marginPercent: 35,
    })
  );

  useEffect(() => {
    localStorage.setItem("calc3d_settings", JSON.stringify(settings));
  }, [settings]);

  const update = (key: string, value: number) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting: update };
}

export function useFabricatedProjects() {
  const [fabricated, setFabricated] = useState<import("./types").FabricatedProject[]>(() => load("calc3d_fabricated", []));

  useEffect(() => {
    localStorage.setItem("calc3d_fabricated", JSON.stringify(fabricated));
  }, [fabricated]);

  const addFabricated = (entry: Omit<import("./types").FabricatedProject, "id">) => {
    setFabricated((prev) => [...prev, { ...entry, id: Date.now().toString() }]);
  };

  const deleteFabricated = (id: string) => {
    setFabricated((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFabricated = (id: string, updates: Partial<import("./types").FabricatedProject>) => {
    setFabricated((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return { fabricated, addFabricated, deleteFabricated, updateFabricated };
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => load("calc3d_expenses", []));

  useEffect(() => {
    localStorage.setItem("calc3d_expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (entry: Omit<Expense, "id">) => {
    setExpenses((prev) => [...prev, { ...entry, id: Date.now().toString() }]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return { expenses, addExpense, deleteExpense };
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>(() => load("calc3d_clients", []));

  useEffect(() => {
    localStorage.setItem("calc3d_clients", JSON.stringify(clients));
  }, [clients]);

  const addClient = (client: Omit<Client, "id" | "createdAt">) => {
    setClients((prev) => [...prev, { ...client, id: Date.now().toString(), createdAt: Date.now() }]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return { clients, addClient, updateClient, deleteClient };
}

export function useInvestmentGoal() {
  const [goal, setGoalState] = useState<number>(() => load("calc3d_goal", 0));

  useEffect(() => {
    localStorage.setItem("calc3d_goal", JSON.stringify(goal));
  }, [goal]);

  return { goal, setGoal: setGoalState };
}

export function useFavoriteColors() {
  const [favorites, setFavorites] = useState<string[]>(() => load("calc3d_fav_colors", []));

  useEffect(() => {
    localStorage.setItem("calc3d_fav_colors", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((color: string) => {
    setFavorites((prev) => {
      if (prev.includes(color)) return prev;
      return [...prev, color].slice(-30);
    });
  }, []);

  const removeFavorite = useCallback((color: string) => {
    setFavorites((prev) => prev.filter((c) => c !== color));
  }, []);

  return { favorites, addFavorite, removeFavorite };
}

// ── Photography hooks ──

export function usePhotoPackages() {
  const [packages, setPackages] = useState<PhotoPackage[]>(() => load("calc3d_photo_packages", []));

  useEffect(() => {
    localStorage.setItem("calc3d_photo_packages", JSON.stringify(packages));
  }, [packages]);

  const addPackage = (pkg: Omit<PhotoPackage, "id" | "createdAt">) => {
    setPackages((prev) => [...prev, { ...pkg, id: Date.now().toString(), createdAt: Date.now() }]);
  };

  const updatePackage = (id: string, updates: Partial<PhotoPackage>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return { packages, addPackage, updatePackage, deletePackage };
}

export function usePhotoQuotes() {
  const [quotes, setQuotes] = useState<PhotoQuote[]>(() => load("calc3d_photo_quotes", []));

  useEffect(() => {
    localStorage.setItem("calc3d_photo_quotes", JSON.stringify(quotes));
  }, [quotes]);

  const addQuote = (quote: Omit<PhotoQuote, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    setQuotes((prev) => [...prev, { ...quote, id: now.toString(), createdAt: now, updatedAt: now }]);
    return now.toString();
  };

  const updateQuote = (id: string, updates: Partial<PhotoQuote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: Date.now() } : q)));
  };

  const deleteQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  return { quotes, addQuote, updateQuote, deleteQuote };
}

export function useBrandSettings() {
  const [brand, setBrandState] = useState<BrandSettings>(() =>
    load("calc3d_brand", {
      businessName: "",
      logo: "",
      primaryColor: "#339966",
      secondaryColor: "#1a1a2e",
      phone: "",
      email: "",
      website: "",
      socialMedia: "",
    })
  );

  useEffect(() => {
    localStorage.setItem("calc3d_brand", JSON.stringify(brand));
  }, [brand]);

  const updateBrand = (updates: Partial<BrandSettings>) => {
    setBrandState((prev) => ({ ...prev, ...updates }));
  };

  return { brand, updateBrand };
}
