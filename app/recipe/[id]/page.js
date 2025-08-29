"use client";

import RecipeDetails from "@/app/components/getRecipePage";

import { appContext } from "@/lib/store/app-context";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";

export default function RecipePage({ params }) {
  const { id } = useParams();
  const { recipes, loading } = useContext(appContext);
  const recipe = recipes.find((r) => r.id === id);
  const [missingArmed, setMissingArmed] = useState(false);

  useEffect(() => {
    if (loading) {
      setMissingArmed(false);
      return;
    }
    if (!recipe) {
      const t = setTimeout(() => setMissingArmed(true), 150);
      return () => clearTimeout(t);
    }
    setMissingArmed(false);
  }, [loading, recipe]);

  if (loading) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[320px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!loading && !recipe && missingArmed) return notFound();

  return (
    <div className="flex flex-col gap-5 p-10">
      {!loading ? <RecipeDetails recipe={recipe} /> : <p>Loading</p>}
    </div>
  );
}
