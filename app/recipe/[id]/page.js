"use client";

import RecipeDetails from "@/app/components/getRecipePage";

import { appContext } from "@/lib/store/app-context";
import { authContext } from "@/lib/store/auth-context";

import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

import { notFound, useParams } from "next/navigation";
import { useEffect, useState, useContext } from "react";

export default function RecipePage({ params }) {
  const { id } = useParams();
  const { recipes, loading: recipeLoading } = useContext(appContext);
  const { loading: authLoading } = useContext(authContext);
  const [recipe, setRecipe] = useState(null);
  const [pending, setPending] = useState(true);
  const [missingArmed, setMissingArmed] = useState(false);

  useEffect(() => {
    let canceled = false;

    async function run() {
      if (authLoading || recipeLoading) {
        setMissingArmed(false);
        return;
      }

      const initRecipe = recipes.find((r) => r.id === id);
      if (initRecipe) {
        if (!canceled) {
          setRecipe(initRecipe);
          setPending(false);
          setMissingArmed(true);
        }
        return;
      }

      setPending(true);
      setMissingArmed(false);

      try {
        const snap = await getDoc(doc(db, "recipes", id));
        if (!snap.exists()) {
          if (!canceled) {
            setMissingArmed(true);
            setPending(false);
          }
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        if (!canceled) {
          setRecipe(data);
          setPending(false);
        }
      } catch {
        if (!canceled) {
          setMissingArmed(true);
          setPending(false);
        }
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [recipeLoading, authLoading, recipes, id]);

  if (recipeLoading || authLoading || pending) {
    return (
      <div className="p-10">
        <div className="w-full min-h-[380px] rounded-2xl bg-neutral-200/80 animate-pulse shadow-sm" />
      </div>
    );
  }

  if (!recipe && missingArmed) return notFound();

  return (
    <div className="flex flex-col gap-5 p-10">
      {!(recipeLoading || authLoading || pending) ? (
        <RecipeDetails recipe={recipe} />
      ) : (
        <p>Loading</p>
      )}
    </div>
  );
}
