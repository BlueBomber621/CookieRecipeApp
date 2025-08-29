"use client";

import { useContext } from "react";
import RecipeList from "./components/recipeList";
import { appContext } from "@/lib/store/app-context";

export default function Home() {
  const { recipes } = useContext(appContext);

  return (
    <div className="flex flex-col gap-5 p-10">
      <div id="allRecipesList">
        <h1 className="text-lg md:text-xl font-bold ml-5">Recipes</h1>
        <RecipeList linkPref={"/recipe/"} recipes={recipes} />
      </div>
    </div>
  );
}
