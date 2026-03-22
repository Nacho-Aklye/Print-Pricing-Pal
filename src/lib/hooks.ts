import { useState, useEffect } from "react";
import type { Material, Recipe } from "./types";
import { DEFAULT_MATERIALS } from "./types";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

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

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => load("calc3d_recipes", []));

  useEffect(() => {
    localStorage.setItem("calc3d_recipes", JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = (recipe: Omit<Recipe, "id" | "createdAt">) => {
    setRecipes((prev) => [...prev, { ...recipe, id: Date.now().toString(), createdAt: Date.now() }]);
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  return { recipes, addRecipe, deleteRecipe };
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
    setSettings((prev: Record<string, number>) => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting: update };
}
