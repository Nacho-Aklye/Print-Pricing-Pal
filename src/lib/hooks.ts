import { useState, useEffect, useCallback } from "react";
import type { Material, Project } from "./types";
import { DEFAULT_MATERIALS } from "./types";

const DATA_VERSION = 3;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Migrate old recipe data to project format */
function migrateData() {
  const version = load("calc3d_version", 0);
  if (version >= DATA_VERSION) return;

  // Migrate recipes → projects
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

  // Add photos field to existing projects
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

  localStorage.setItem("calc3d_version", JSON.stringify(DATA_VERSION));
}

// Run migration on module load
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

export function useFavoriteColors() {
  const [favorites, setFavorites] = useState<string[]>(() => load("calc3d_fav_colors", []));

  useEffect(() => {
    localStorage.setItem("calc3d_fav_colors", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((color: string) => {
    setFavorites((prev) => {
      if (prev.includes(color)) return prev;
      return [...prev, color].slice(-30); // max 30 favorites
    });
  }, []);

  const removeFavorite = useCallback((color: string) => {
    setFavorites((prev) => prev.filter((c) => c !== color));
  }, []);

  return { favorites, addFavorite, removeFavorite };
}
